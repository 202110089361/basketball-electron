import axios from 'axios';
import { Match, GameInfo } from '../types/match';

const API_URL = '/api/matches';

export const matchService = {
  // 获取所有比赛
  getMatches: async (): Promise<Match[]> => {
    const response = await axios.get(API_URL);
    return response.data as Match[];
  },
  // 获取单场比赛
  getMatch: async (id: string): Promise<Match> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data as Match;
  },
  // 创建新比赛
  createMatch: async (matchData: Partial<GameInfo>): Promise<Match> => {
    const response = await axios.post(API_URL, { gameInfo: matchData });
    return response.data as Match;
  },
  // 更新比赛信息
  updateMatchInfo: async (id: string, matchInfo: Partial<GameInfo>): Promise<Match> => {
    const response = await axios.patch(`${API_URL}/${id}/info`, matchInfo);
    return response.data as Match;
  },
  // 开始比赛
  startMatch: async (id: string): Promise<Match> => {
    const response = await axios.post(`${API_URL}/${id}/start`);
    return response.data as Match;
  }
};