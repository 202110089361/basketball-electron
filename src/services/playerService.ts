import axios from 'axios';
import { Player, CreatePlayerDto, UpdatePlayerDto } from '../types/player';

const API_URL = '/api/players';

export const playerService = {
  // 获取所有球员
  async getAllPlayers(): Promise<Player[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // 按球队获取球员
  async getPlayersByTeam(team: string): Promise<Player[]> {
    const response = await axios.get(`${API_URL}/team/${team}`);
    return response.data;
  },

  // 获取单个球员
  async getPlayerById(id: string): Promise<Player> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // 创建新球员
  async createPlayer(player: CreatePlayerDto): Promise<Player> {
    const response = await axios.post(API_URL, player);
    return response.data;
  },

  // 更新球员信息
  async updatePlayer(id: string, player: UpdatePlayerDto): Promise<Player> {
    const response = await axios.patch(`${API_URL}/${id}`, player);
    return response.data;
  },

  // 删除球员
  async deletePlayer(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }
};