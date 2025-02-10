import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { Player } from '../models/types';

const router = express.Router();

// 获取比赛的所有球员
router.get('/:matchId/players', async (req, res) => {
  try {
    const players = await db.players.read();
    const matchPlayers = players.filter((p: Player) => p.matchId === req.params.matchId);
    res.json(matchPlayers);
  } catch (error) {
    res.status(500).json({ message: '获取球员列表失败' });
  }
});

// 添加球员到比赛
router.post('/:matchId/players', async (req, res) => {
  try {
    const players = await db.players.read();
    const newPlayer: Player = {
      id: uuidv4(),
      matchId: req.params.matchId,
      ...req.body
    };
    players.push(newPlayer);
    await db.players.write(players);
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('添加球员失败:', error);
    res.status(500).json({ message: '添加球员失败' });
  }
});

// 更新球员信息
router.patch('/:matchId/players/:playerId', async (req, res) => {
  try {
    const players = await db.players.read();
    const index = players.findIndex(
      (p: Player) => p.id === req.params.playerId && p.matchId === req.params.matchId
    );
    if (index === -1) {
      res.status(404).json({ message: '球员不存在' });
      return;
    }
    players[index] = { ...players[index], ...req.body, updatedAt: new Date() };
    await db.players.write(players);
    res.json(players[index]);
  } catch (error) {
    res.status(500).json({ message: '更新球员信息失败' });
  }
});

// 从比赛中删除球员
router.delete('/:matchId/players/:playerId', async (req, res) => {
  try {
    const players = await db.players.read();
    const index = players.findIndex(
      (p: Player) => p.id === req.params.playerId && p.matchId === req.params.matchId
    );
    if (index === -1) {
      res.status(404).json({ message: '球员不存在' });
      return;
    }
    players.splice(index, 1);
    await db.players.write(players);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: '删除球员失败' });
  }
});

export default router;