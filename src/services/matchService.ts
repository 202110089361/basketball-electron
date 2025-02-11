import axios from 'axios';
import { Match, GameInfo } from '../types/match';

// 根据环境设置不同的 baseURL
const isDev = process.env.NODE_ENV === 'development';
const API_URL = isDev ? '/api/matches' : 'http://localhost:3000/matches';

export const matchService = {
  // 获取所有比赛
  getMatches: async (): Promise<Match[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // 获取单场比赛
  getMatch: async (id: string): Promise<Match> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // 创建新比赛
  createMatch: async (matchData: Partial<GameInfo>): Promise<Match> => {
    const response = await axios.post(API_URL, { gameInfo: matchData });
    return response.data;
  },

  // 更新比赛信息
  updateMatchInfo: async (id: string, matchInfo: Partial<GameInfo>): Promise<Match> => {
    const response = await axios.patch(`${API_URL}/${id}/info`, matchInfo);
    return response.data;
  },

  // 开始比赛
  startMatch: async (id: string): Promise<Match> => {
    const response = await axios.post(`${API_URL}/${id}/start`);
    return response.data;
  }
};