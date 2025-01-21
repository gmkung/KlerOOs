export enum QuestionPhase {
  NOT_CREATED = 'NOT_CREATED',
  OPEN = 'OPEN',
  PENDING_ARBITRATION = 'PENDING_ARBITRATION',
  FINALIZED = 'FINALIZED',
  SETTLED_TOO_SOON = 'SETTLED_TOO_SOON'
}

export enum ArbitrationStatus {
  WAITING = 'WAITING',
  APPEALABLE = 'APPEALABLE',
  SOLVED = 'SOLVED'
}

export interface Answer {
  value: string;
  bond: string;
  timestamp: number;
  provider: string;
}

export interface Evidence {
  id: string;
  URI: string;
  URI_contents: {
    name: string;
    description: string;
  };
  creationTime: string;
  sender: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  phase: QuestionPhase;
  arbitrationStatus?: ArbitrationStatus;
  currentBond: string;
  timeRemaining: number;
  answers: Answer[];
  evidence: Evidence[];
  finalAnswer?: string;
  disputeId?: number;
  appealPeriodEnd?: number;
  minimumBond: string;
} 