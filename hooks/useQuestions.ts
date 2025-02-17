import { useState, useEffect, useCallback, useRef } from "react";
import { Question, QuestionPhase } from "@/types/questions";
import { Chain } from "@/constants/chains";
import { BRIDGES } from "@/constants/bridges";

const ANSWERED_TOO_SOON =
  "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const BATCH_SIZE = 1000; // Number of questions to fetch per batch

const getQuestionsQuery = (
  chainName: string,
  searchTerm: string,
  lastCreatedTimestamp?: number
) => {
  const actualSearchTerm = searchTerm.trim()
    ? `data_contains_nocase: "${searchTerm.trim()}"`
    : "";
  const timestampFilter = lastCreatedTimestamp
    ? `createdTimestamp_lt: ${lastCreatedTimestamp}`
    : "";

  return `
    query GetQuestions {
      questions(
        orderBy: createdTimestamp
        orderDirection: desc
        first: ${BATCH_SIZE}
        where: { 
          arbitrator_in: ["${BRIDGES.filter(
            (bridge) =>
              bridge["Home Chain"] === chainName && bridge["Home Proxy"]
          )
            .map((bridge) =>
              (bridge["Home Proxy"] as string).split("#")[0].toLowerCase()
            )
            .join('", "')}"],
          ${actualSearchTerm ? `${actualSearchTerm},` : ""}
          ${timestampFilter}
        }
      ) {
        id
        questionId
        arbitrator
        data
        minBond
        contract
        createdTimestamp
        timeout
        qType
        bounty
        currentAnswer
        currentAnswerBond
        template {
          id
          user
          templateId
          questionText
        }
        openingTimestamp
        currentScheduledFinalizationTimestamp
        answerFinalizedTimestamp
        isPendingArbitration
        arbitrationRequestedBy
        responses (orderBy:timestamp) {
          id
          answer
          bond
          user
          timestamp
        }
        answers(orderBy: timestamp) {
          id
          answer
          lastBond
          timestamp
        }
      }
    }
  `;
};

const parseQuestionData = (
  data: string,
  qType: string,
  template?: { questionText: string }
) => {
  try {
    // If there's a template, try to parse using the template format
    if (template?.questionText) {
      const dataValues = data.split("␟");
      let valueIndex = 0;

      const unescapedTemplate = template.questionText;

      // Complete the template by replacing each %s with its corresponding value
      const completedTemplate = unescapedTemplate.replace(/%s/g, () => {
        const value = dataValues[valueIndex];
        valueIndex++;
        return value || "";
      });

      try {
        const questionData = JSON.parse(completedTemplate);

        // Extract options from outcomes if present
        const options =
          questionData.type === "single-select" && questionData.outcomes
            ? Array.isArray(questionData.outcomes)
              ? questionData.outcomes
              : questionData.outcomes
                  .split(",")
                  .map((opt: string) => opt.trim())
            : questionData.type === "bool"
              ? ["No", "Yes"]
              : [];

        return {
          title: questionData.title,
          options,
          description: "Please select one of the options",
          category: questionData.category,
        };
      } catch (parseError) {
        console.error("Failed to parse template:", {
          data,
          templateText: template.questionText,
          completedTemplate,
          error: parseError,
        });
        return null;
      }
    }

    // Fallback to original direct parsing if no template
    const [title, optionsStr, category] = data.split("␟");
    const options =
      qType === "single-select"
        ? optionsStr
            .match(/(?:[^,"]|"(?:[^"])*")+/g)
            ?.map((opt) => opt.trim().replace(/^"|"$/g, "").trim()) || []
        : [];

    return {
      title,
      options,
      description: "Please select one of the options",
      category,
    };
  } catch (error) {
    console.error("Error parsing question data:", error);
    // Return a default structure if parsing fails
    return {
      title: data,
      options: [],
      description: "Please select one of the options",
      category: "Unknown",
    };
  }
};

const determineQuestionPhase = (q: any): QuestionPhase => {
  const now = Math.floor(Date.now() / 1000);
  const timeout = parseInt(q.timeout);
  const finalizedTime = parseInt(q.answerFinalizedTimestamp);
  const openingTime = parseInt(q.openingTimestamp);

  // Not Created
  if (timeout === 0) {
    return QuestionPhase.NOT_CREATED;
  }

  // Pending Arbitration takes precedence
  if (q.isPendingArbitration) {
    return QuestionPhase.PENDING_ARBITRATION;
  }

  // Finalized
  if (finalizedTime !== 0 && finalizedTime <= now) {
    // Check if settled too soon (with unresolved answer)

    return QuestionPhase.FINALIZED;
  }

  // Upcoming
  if (openingTime > now) {
    return QuestionPhase.UPCOMING;
  }

  // Open (default state if other conditions aren't met)
  return QuestionPhase.OPEN;
};

const transformSubgraphQuestion = (q: any): Question => {
  const parsed = parseQuestionData(q.data, q.qTyp, q.template) || {
    title: q.data,
    description: "",
    options: [],
    category: "Unknown",
  };
  const { title, description, options } = parsed;
  const phase = determineQuestionPhase(q);

  const calculateTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000);
    const finalizationTime = q.currentScheduledFinalizationTimestamp
      ? parseInt(q.currentScheduledFinalizationTimestamp)
      : 0;
    if (finalizationTime && finalizationTime > now) {
      return (finalizationTime - now) * 1000;
    }
    return 0;
  };

  const calculateTimeToOpen = () => {
    const now = Math.floor(Date.now() / 1000);
    const openingTime = parseInt(q.openingTimestamp);
    if (openingTime && openingTime > now) {
      return (openingTime - now) * 1000;
    }
    return 0;
  };

  const parseAnswer = (answerHex: string) => {
    // Convert answer hex to actual answer

    if (answerHex === ANSWERED_TOO_SOON) return "Answered Too Soon";
    if (answerHex === INVALID_ANSWER) return "Invalid Answer";

    return answerHex;
  };

  return {
    id: q.questionId,
    title,
    description,
    options,
    arbitrator: q.arbitrator,
    contract: q.contract,
    phase,
    qType: q.qType,
    currentAnswer: q.currentAnswer,
    currentBond: q.currentAnswerBond || q.bounty,
    minimumBond: q.minBond,
    timeRemaining: calculateTimeRemaining(),
    timeToOpen: calculateTimeToOpen(),
    createdTimestamp: parseInt(q.createdTimestamp),
    openingTimestamp: parseInt(q.openingTimestamp),
    arbitrationRequestedBy: q.arbitrationRequestedBy,
    currentScheduledFinalizationTimestamp:
      q.currentScheduledFinalizationTimestamp,
    answers: q.answers.map((a: any) => ({
      value: parseAnswer(a.answer),
      bond: a.lastBond,
      timestamp: parseInt(a.timestamp) * 1000,
    })),
    responses: q.responses.map((r: any) => ({
      value: parseAnswer(r.answer),
      timestamp: parseInt(r.timestamp) * 1000,
      bond: r.bond,
      user: r.user,
    })),
    finalAnswer:
      phase === QuestionPhase.FINALIZED
        ? parseAnswer(q.currentAnswer)
        : undefined,
  };
};

export const useQuestions = ({
  selectedChain,
  searchTerm = "",
}: {
  selectedChain: Chain;
  searchTerm: string;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentChainRef = useRef(selectedChain.id);

  const fetchAllBatches = useCallback(async () => {
    const abortController = new AbortController();
    let hasMore = true;
    let currentQuestions: Question[] = [];  // Local array to track questions
    
    try {
      setError(null);
      setLoading(true);

      while (hasMore && !abortController.signal.aborted) {
        const lastCreatedTimestamp = currentQuestions.length > 0 
          ? currentQuestions[currentQuestions.length - 1].createdTimestamp 
          : undefined;

        if (currentChainRef.current !== selectedChain.id) {
          abortController.abort();
          return;
        }

        const query = getQuestionsQuery(
          selectedChain.name,
          searchTerm,
          lastCreatedTimestamp
        );

        const response = await fetch(selectedChain.subgraphUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: abortController.signal,
        });

        const json = await response.json();
        if (json.errors) {
          console.error("GraphQL Errors:", json.errors);
          setError("Failed to fetch questions.");
          return;
        }

        // Process and add questions one by one
        for (const question of json.data.questions) {
          if (abortController.signal.aborted) break;
          const transformedQuestion = transformSubgraphQuestion(question);
          currentQuestions.push(transformedQuestion);
          setQuestions(prev => [...prev, transformedQuestion]);
        }

        // Check if we should continue fetching
        hasMore = json.data.questions.length === BATCH_SIZE;
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
        return;
      }
      console.error("Error fetching questions:", error);
      setError("An unexpected error occurred.");
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
    return abortController;
  }, [selectedChain, searchTerm]); // Removed questions from dependencies

  useEffect(() => {
    currentChainRef.current = selectedChain.id;
    setQuestions([]);
    let controller: AbortController | undefined;
    fetchAllBatches().then((c) => (controller = c));

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [selectedChain.id, searchTerm, fetchAllBatches]);

  return {
    questions,
    loading,
    error
  };
};
