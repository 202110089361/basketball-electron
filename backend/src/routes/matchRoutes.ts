import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { Match } from '../models/types';

const router = express.Router();

// 获取所有比赛
router.get('/', async (req, res) => {
  console.log('收到获取比赛列表请求');
  try {
    const matches = await db.matches.read();
    console.log('成功读取比赛列表:', matches.length, '场比赛');
    res.json(matches);
  } catch (error) {
    console.error('获取比赛列表失败:', error);
    res.status(500).json({ message: '获取比赛列表失败' });
  }
});

// 获取单个比赛
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('收到获取单个比赛请求, id:', id);
  try {
    const matches = await db.matches.read();
    console.log('成功读取比赛数据');
    const match = matches.find((m: Match) => m.id === id);
    if (!match) {
      console.log('未找到指定比赛:', id);
      res.status(404).json({ message: '比赛不存在' });
      return;
    }
    console.log('成功找到比赛:', match);
    res.json(match);
  } catch (error) {
    console.error('获取比赛信息失败:', error);
    res.status(500).json({ message: '获取比赛信息失败' });
  }
});

// 创建新比赛
router.post('/', async (req, res) => {
  try {
    const matches = await db.matches.read();
    const newMatch: Match = {
      id: uuidv4(),
      ...req.body,
      scores: {
        firstHalf1: { teamA: 0, teamB: 0 },
        firstHalf2: { teamA: 0, teamB: 0 },
        secondHalf1: { teamA: 0, teamB: 0 },
        secondHalf2: { teamA: 0, teamB: 0 }
      },
      teamFouls: {
        teamA: {
          firstHalf1: [],
          firstHalf2: [],
          secondHalf1: [],
          secondHalf2: []
        },
        teamB: {
          firstHalf1: [],
          firstHalf2: [],
          secondHalf1: [],
          secondHalf2: []
        }
      },
      scoreRecords: {
        teamA: [],
        teamB: []
      }
    };
    matches.push(newMatch);
    await db.matches.write(matches);
    res.status(201).json(newMatch);
  } catch (error) {
    console.error('创建比赛失败:', error);
    res.status(500).json({ message: '创建比赛失败' });
  }
});

// 更新比赛信息
router.patch('/:id', async (req, res) => {
  try {
    const matches = await db.matches.read();
    const index = matches.findIndex((m: Match) => m.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ message: '比赛不存在' });
      return;
    }
    matches[index] = { ...matches[index], ...req.body };
    await db.matches.write(matches);
    res.json(matches[index]);
  } catch (error) {
    console.error('更新比赛信息失败:', error);
    res.status(500).json({ message: '更新比赛信息失败' });
  }
});

// 删除比赛
router.delete('/:id', async (req, res) => {
  try {
    const matches = await db.matches.read();
    const index = matches.findIndex((m: Match) => m.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ message: '比赛不存在' });
      return;
    }
    matches.splice(index, 1);
    await db.matches.write(matches);
    res.status(204).send();
  } catch (error) {
    console.error('删除比赛失败:', error);
    res.status(500).json({ message: '删除比赛失败' });
  }
});

export default router;