import { Evidence } from './questions';

export interface Dispute {
  id: string;
  period: number;
  periodDeadline: string;
  nbRounds: string;
  nbChoices: string;
  rounds: {
    jurors: string;
    isCurrentRound: boolean;
  }[];
  lastPeriodChangeTs: string;
  arbitrableHistory: {
    id: string;
    metaEvidence: string;
  }[];
  arbitrated: string;
  ruled: boolean;
  ruling: string;
  evidenceGroup: {
    id: string;
    length: string;
    evidence: Evidence[];
  };
} 