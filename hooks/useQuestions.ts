import { useState, useEffect, useCallback, useRef } from "react";
import { Question, QuestionPhase } from "@/types/questions";
import { Chain } from "@/constants/chains";
import { BRIDGES } from "@/constants/bridges";

const ANSWERED_TOO_SOON =
  "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const UNRESOLVED_ANSWER =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const UNANSWERED = "0";

const BATCH_SIZE = 1000; // Number of questions to fetch per batch

const getQuestionsQuery = (
  chainName: string,
  searchTerm: string,
  lastCreatedTimestamp?: number
) => {
  const actualSearchTerm = searchTerm.trim() ? `data_contains_nocase: "${searchTerm.trim()}"` : "";
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
              (bridge["Home Proxy"] as string)
                .split("#")[0]
                .toLowerCase()
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
        createdTimestamp
        timeout
        bounty
        currentAnswer
        currentAnswerBond
        answerFinalizedTimestamp
        isPendingArbitration
        arbitrationRequestedBy
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

const parseQuestionData = (data: string) => {
  const [title, options, category, language] = data.split("␟");
  return {
    title,
    description: `Options: ${options}`,
    category,
    language,
  };
};

const determineQuestionPhase = (q: any): QuestionPhase => {
  const now = Math.floor(Date.now() / 1000);
  const timeout = parseInt(q.timeout);
  const finalizedTime = parseInt(q.answerFinalizedTimestamp);

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
    if (q.currentAnswer === UNRESOLVED_ANSWER) {
      return QuestionPhase.SETTLED_TOO_SOON;
    }
    return QuestionPhase.FINALIZED;
  }

  // Open (default state if other conditions aren't met)
  return QuestionPhase.OPEN;
};

const transformSubgraphQuestion = (q: any): Question => {
  const { title, description } = parseQuestionData(q.data);
  const phase = determineQuestionPhase(q);

  const calculateTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000);
    const finalizationTime = parseInt(q.answerFinalizedTimestamp);
    if (finalizationTime && finalizationTime > now) {
      return (finalizationTime - now) * 1000;
    }
    return 0;
  };

  const parseAnswer = (answerHex: string) => {
    // Convert answer hex to actual answer
    if (answerHex === UNRESOLVED_ANSWER) return "Unanswered";
    if (answerHex === ANSWERED_TOO_SOON) return "Answered Too Soon";
    if (answerHex === INVALID_ANSWER) return "Invalid Answer";

    return answerHex;
  };

  return {
    id: q.questionId,
    title,
    description,
    arbitrator: q.arbitrator,
    phase,
    currentBond: q.currentAnswerBond || q.bounty,
    minimumBond: q.minBond,
    timeRemaining: calculateTimeRemaining(),
    createdTimestamp: parseInt(q.createdTimestamp),
    arbitrationRequestedBy: q.arbitrationRequestedBy,
    answers: q.answers.map((a: any) => ({
      value: parseAnswer(a.answer),
      bond: a.lastBond,
      timestamp: parseInt(a.timestamp) * 1000,
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

  const fetchAllQuestions = useCallback(async () => {
    const abortController = new AbortController();
    try {
      setLoading(true);
      setError(null);
      let allQuestions: Question[] = [];
      let lastCreatedTimestamp: number | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        if (currentChainRef.current !== selectedChain.id) {
          abortController.abort();
          return;
        }

        if (abortController.signal.aborted) {
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
          signal: abortController.signal
        });

        const json = await response.json();
        if (json.errors) {
          console.error("GraphQL Errors:", json.errors);
          setError("Failed to fetch questions.");
          break;
        }

        const fetchedQuestions = json.data.questions.map(transformSubgraphQuestion);
        if (fetchedQuestions.length === 0) {
          hasMore = false;
          break;
        }

        allQuestions = [...allQuestions, ...fetchedQuestions];
        if (fetchedQuestions.length < BATCH_SIZE) {
          hasMore = false;
          break;
        }

        lastCreatedTimestamp = fetchedQuestions[fetchedQuestions.length - 1].createdTimestamp;
      }

      if (!abortController.signal.aborted) {
        setQuestions(allQuestions);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch aborted');
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
  }, [selectedChain, searchTerm]);

  useEffect(() => {
    currentChainRef.current = selectedChain.id;
    setQuestions([]);
    let controller: AbortController | undefined;
    fetchAllQuestions().then(c => controller = c);

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchAllQuestions]);

  return {
    questions,
    loading,
    error,
  };
};
