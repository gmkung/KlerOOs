import { useState, useEffect } from "react";
import { Question, QuestionPhase, Answer } from "@/types/questions";
import { mockSubgraphData } from "@/mocks/questions";

const UNRESOLVED_ANSWER =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const UNANSWERED = "0";

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

  return {
    id: q.questionId,
    title,
    description,
    phase,
    currentBond: q.bounty,
    minimumBond: "1000000000000000", // 0.001 ETH as minimum
    timeRemaining: calculateTimeRemaining(),
    answers: q.answers.map((a: any) => ({
      value: a.lastBond === "0" ? "Elena Lasconi" : "Cǎlin Georgescu", // Simplified - should parse currentAnswer hex
      bond: a.lastBond,
      timestamp: parseInt(a.timestamp) * 1000,
      provider: a.question.id.split("-")[0],
    })),
    evidence: [], // Will be populated later when viewing details
    finalAnswer:
      phase === QuestionPhase.FINALIZED
        ? q.currentAnswer === UNRESOLVED_ANSWER
          ? "Unresolved"
          : q.currentAnswer ===
              "0x0000000000000000000000000000000000000000000000000000000000000001"
            ? "Cǎlin Georgescu"
            : "Elena Lasconi"
        : undefined,
  };
};

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transformedQuestions = mockSubgraphData.data.questions.map(
      transformSubgraphQuestion
    );
    setQuestions(transformedQuestions);
    setLoading(false);
  }, []);

  return {
    questions,
    loading,
  };
};
