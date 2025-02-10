import React, { useState, useEffect } from 'react';
import { Card, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import GameCourt from '../components/GameCourt';
import axios from 'axios';
import { Match } from '../types';

const GameRecorder: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      console.log('开始加载比赛信息，matchId:', matchId);
      loadMatch();
    }
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      console.log('正在发送请求到:', `/matches/${matchId}`);
      const response = await axios.get(`/matches/${matchId}`);
      console.log('收到响应:', response.data);

      if (!response.data) {
        console.error('比赛数据为空');
        message.error('比赛不存在');
        navigate('/');
        return;
      }
      setMatch(response.data);
    } catch (error: any) {
      console.error('加载比赛信息失败:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      message.error('加载比赛信息失败');
      navigate('/');
    } finally {
      setLoading(false);
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
    <Card title={`${match.name} (${match.teamA} vs ${match.teamB})`}>
      <GameCourt matchId={matchId!} />
    </Card>
  );
};

export default GameRecorder;