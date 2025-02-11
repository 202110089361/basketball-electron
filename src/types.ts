export interface Match {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
  date: string;
  time?: string;
  location?: string;
  mainReferee?: string;
  assistantReferee?: string;
  coachA?: string;
  coachB?: string;
  assistantCoachA?: string;
  assistantCoachB?: string;
  quarterLength: number;
  currentTime?: number;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  team: 'A' | 'B';
  isStarter?: boolean;
  certificateNumber?: string;
}

export interface GameEvent {
  id: number;
  time: string;
  type: string;
  team: 'A' | 'B';
  player: string;
  points?: number;
  attempts?: number;
  made?: number;
  position?: { x: number; y: number };
  description?: string;
  quarter?: number;
}

export interface TeamScore {
  points: number;
  fouls: number;
  timeouts: number;
}

export interface Quarter {
  id: number;
  name: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface EventMarker {
  x: number;
  y: number;
  team: 'A' | 'B';
  type: string;
  id: number;
}