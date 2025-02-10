export interface Match {
  id: string;
  name: string;
  date: string;
  time?: string;
  location?: string;
  teamA: string;
  teamB: string;
  mainReferee?: string;
  assistantReferee?: string;
  coachA?: string;
  coachB?: string;
  assistantCoachA?: string;
  assistantCoachB?: string;
  quarterLength: number;
  scores?: {
    firstHalf1: { teamA: number; teamB: number; };
    firstHalf2: { teamA: number; teamB: number; };
    secondHalf1: { teamA: number; teamB: number; };
    secondHalf2: { teamA: number; teamB: number; };
    overtime?: { teamA: number; teamB: number; };
  };
  teamFouls?: {
    teamA: {
      firstHalf1: number[];
      firstHalf2: number[];
      secondHalf1: number[];
      secondHalf2: number[];
    };
    teamB: {
      firstHalf1: number[];
      firstHalf2: number[];
      secondHalf1: number[];
      secondHalf2: number[];
    };
  };
  scoreRecords?: {
    teamA: number[];
    teamB: number[];
  };
}

export interface Player {
  id: string;
  name: string;
  number: string;
  team: 'A' | 'B';
  matchId: string;
  isStarter?: boolean;
  personalFouls?: number[];
  certificateNumber?: string;
}

export interface GameEvent {
  id: string;
  matchId: string;
  time: number;
  type: string;
  team: 'A' | 'B';
  player: string;
  points?: number;
  position?: {
    x: number;
    y: number;
  };
  description?: string;
  quarter: number;
}