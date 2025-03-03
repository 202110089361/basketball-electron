import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import GameCourt from '../components/GameCourt';
import axios from 'axios';
import MatchScoreSheet from '../components/MatchScoreSheet';
import { GameEvent, Match } from '@/types';

// 根据环境设置不同的 baseURL
const isDev = process.env.NODE_ENV === 'development';
axios.defaults.baseURL = isDev ? '' : 'http://localhost:3000';

const GameRecorder: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    if (matchId) {
      console.log('开始加载比赛信息，matchId:', matchId);
      loadMatch();
      loadPlayers(); // 添加加载球员信息
    }
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      console.log('正在发送请求到:', `/matches/${matchId}`);
      const response = await axios.get(`/matches/${matchId}`);
      console.log('收到比赛数据响应:', response.data);

      if (!response.data) {
        console.error('比赛数据为空');
        message.error('比赛不存在');
        navigate('/');
        return;
      }
      setMatch(response.data);
      setEvents(response.data.events || []);
    } catch (error: any) {
      console.error('加载比赛信息失败:', error);
      message.error('加载比赛信息失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      console.log('正在加载球员信息...');
      const response = await axios.get(`/matches/${matchId}/players`);
      console.log('收到球员数据响应:', response.data);
      setPlayers(response.data || []);
    } catch (error) {
      console.error('加载球员信息失败:', error);
      message.error('加载球员信息失败');
    }
  };

  const handleEvent = (event: GameEvent) => {
    setEvents(prevEvents => [...prevEvents, event]);
    // 保存事件到数据库
    try {
      axios.post(`/matches/${matchId}/events`, event);
    } catch (error) {
      console.error('保存事件失败:', error);
      message.error('保存事件失败');
    }
  };

  const handleTimeUpdate = (time: number) => {
    if (!match) return;

    try {
      axios.patch(`/matches/${matchId}`, {
        currentTime: time
      });
    } catch (error) {
      console.error('更新比赛时间失败:', error);
      message.error('更新比赛时间失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!match) {
    console.log('比赛数据为空，返回 null');
    return null;
  }

  console.log('渲染比赛界面:', match);
  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <GameCourt
            match={match}
            players={players}
            onEvent={handleEvent}
            onTimeUpdate={handleTimeUpdate}
          />
          <MatchScoreSheet
            match={match}
            players={players}
            events={events}
          />
        </>
      )}
    </div>
  );
};

export default GameRecorder;