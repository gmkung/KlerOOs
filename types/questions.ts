export enum QuestionPhase {
  NOT_CREATED = 'NOT_CREATED',
  OPEN = 'OPEN',
  UPCOMING = 'UPCOMING',
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
  arbitrator: string;
  options: string[],
  qType: string;
  phase: QuestionPhase;
  currentAnswer: string;
  openingTimestamp: number;
  arbitrationStatus?: ArbitrationStatus;
  currentBond: string;
  timeToOpen: number;
  timeRemaining: number;
  answers: Answer[];
  createdTimestamp: number;
  currentScheduledFinalizationTimestamp?: string;
  finalAnswer?: string;
  disputeId?: number;
  appealPeriodEnd?: number;
  minimumBond: string;
  arbitrationRequestedBy?: string;
} 