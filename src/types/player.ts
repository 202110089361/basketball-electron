export interface Player {
  id: string;
  name: string;
  number: string;
  team: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlayerDto {
  name: string;
  number: string;
  team: string;
}

export interface UpdatePlayerDto {
  name?: string;
  number?: string;
  team?: string;
}