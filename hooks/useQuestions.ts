import { useState, useEffect, useCallback } from "react";
import { Question, QuestionPhase, Answer } from "@/types/questions";
import { Chain } from "@/constants/chains";
import { BRIDGES } from "@/constants/bridges";

const ANSWERED_TOO_SOON =
  "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";
const INVALID_ANSWER =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const UNRESOLVED_ANSWER =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const UNANSWERED = "0";

const getQuestionsQuery = (chainName: string) => {
  return (lastTimestamp: string, searchTerm?: string) => {
    const actualSearchTerm = searchTerm || "";
    return `
      query GetQuestions {
        questions(
          orderBy: createdTimestamp
          orderDirection: desc
          first: 1000
          where: { 
            arbitrator_in: ["${BRIDGES.filter(
              (bridge) =>
                bridge["Home Chain"] === chainName && bridge["Home Proxy"]
            )
              .map((bridge) =>
                (bridge["Home Proxy"] as string).split("#")[0].toLowerCase()
              )
              .join('", "')}"],
            createdTimestamp_lt: "${lastTimestamp}"
            ${actualSearchTerm ? `, data_contains: "${actualSearchTerm}"` : ""}
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
  searchTerm?: string;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const response = await fetch(selectedChain.subgraphUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: getQuestionsQuery(selectedChain.name)(timestamp, searchTerm),
        }),
      });

      const json = await response.json();
      if (json.errors) {
        console.error("GraphQL Errors:", json.errors);
        return;
      }

      const newQuestions = json.data.questions.map(transformSubgraphQuestion);
      setQuestions(newQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedChain, searchTerm]);

  useEffect(() => {
    setQuestions([]);
    setLoading(true);
    fetchQuestions();
  }, [selectedChain, searchTerm, fetchQuestions]);

  return { 
    questions, 
    loading
  };
};
