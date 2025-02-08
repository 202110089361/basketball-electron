import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { useParams } from 'react-router-dom';
import GameCourt from '../components/GameCourt';
import axios from 'axios';

interface Match {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
}

const GameRecorder: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (matchId) {
      loadMatch();
    }
  }, [matchId]);

  const loadMatch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/matches/${matchId}`);
      setMatch(response.data);
    } catch (error) {
      message.error('加载比赛信息失败');
    }
  };

  if (!match) {
    return <div>加载中...</div>;
  }

  return (
    <Card title={`${match.name} (${match.teamA} vs ${match.teamB})`}>
      <GameCourt matchId={matchId!} />
    </Card>
  );
};

export default GameRecorder;