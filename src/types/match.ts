export interface Player {
  name: string;
  number: string;
  position: string;
}

export interface GameInfo {
  matchName: string;
  matchId: string;
  date: string;
  location: string;
  matchType: string;
  referees: string[];
  homeTeam: string;
  awayTeam: string;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  score: {
    home: number;
    away: number;
  };
  status: 'pending' | 'ready' | 'in_progress' | 'finished';
  startTime?: Date;
  endTime?: Date;
}

export interface Match {
  _id: string;
  gameInfo: GameInfo;
  events: Array<{
    type: string;
    time: number;
    player: string;
    position: {
      x: number;
      y: number;
    };
    team: string;
  }>;
  gameTime: number;
  createdAt: Date;
}