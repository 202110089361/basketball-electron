import React from 'react';
import styled from 'styled-components';
import { Match, Player } from '../types';
import { Switch } from 'antd';

interface Props {
  match: Match;
  players: Player[];
}

const ScoreSheetContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  font-family: SimSun, serif;
  font-size: 16px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  h1 {
    font-size: 24px;
    margin-bottom: 10px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  font-size: 16px;
`;

const TeamSection = styled.div`
  margin-bottom: 20px;
  h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const ScoreTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    border: 1px solid black;
    padding: 6px 10px;
    text-align: center;
    font-size: 16px;
  }
`;

const MatchScoreSheet: React.FC<Props> = ({ match, players }) => {
  // 从 localStorage 加载比赛数据
  const loadMatchData = (matchId: string) => {
    const teamA = localStorage.getItem(`match_${matchId}_teamA`);
    const teamB = localStorage.getItem(`match_${matchId}_teamB`);
    const events = localStorage.getItem(`match_${matchId}_events`);
    const time = localStorage.getItem(`match_${matchId}_time`);
    const rawTime = localStorage.getItem(`match_${matchId}_rawTime`);

    return {
      teamA: teamA ? JSON.parse(teamA) : { points: 0, fouls: 0, timeouts: 0 },
      teamB: teamB ? JSON.parse(teamB) : { points: 0, fouls: 0, timeouts: 0 },
      events: events ? JSON.parse(events) : [],
      time: time ? JSON.parse(time) : '00:00.0',
      rawTime: rawTime ? JSON.parse(rawTime) : 0
    };
  };

  // 格式化比赛时间
  const formatGameTime = (timeStr: string) => {
    if (!timeStr || timeStr === '00:00.0') return '0分0秒';

    try {
      const [minutes, rest] = timeStr.split(':');
      const [seconds] = rest.split('.');
      return `${parseInt(minutes)}分${parseInt(seconds)}秒`;
    } catch (error) {
      return '0分0秒';
    }
  };

  const matchData = loadMatchData(match.id);

  const getTeamPlayers = (team: 'A' | 'B') => {
    return players.filter(p => p.team === team);
  };

  // 计算每个球员的犯规次数
  const calculatePlayerFouls = (playerName: string, team: 'A' | 'B') => {
    if (!matchData.events) return 0;
    return matchData.events.filter((event: any) =>
      event.player === playerName &&
      event.team === team &&
      (event.type === '防守犯规' || event.type === '进攻犯规' || event.type === '技术犯规')
    ).length;
  };

  // 计算每节得分
  const calculateQuarterScores = () => {
    const quarterScores = {
      firstHalf1: { teamA: 0, teamB: 0 },
      firstHalf2: { teamA: 0, teamB: 0 },
      secondHalf1: { teamA: 0, teamB: 0 },
      secondHalf2: { teamA: 0, teamB: 0 }
    };

    if (matchData.events) {
      matchData.events.forEach((event: any) => {
        if ((event.type === '得分' || event.type === '罚球') && event.quarter) {
          const points = event.points || 0;
          const team = event.team;

          switch (event.quarter) {
            case 1:
              if (team === 'A') {
                quarterScores.firstHalf1.teamA += points;
              } else {
                quarterScores.firstHalf1.teamB += points;
              }
              break;
            case 2:
              if (team === 'A') {
                quarterScores.firstHalf2.teamA += points;
              } else {
                quarterScores.firstHalf2.teamB += points;
              }
              break;
            case 3:
              if (team === 'A') {
                quarterScores.secondHalf1.teamA += points;
              } else {
                quarterScores.secondHalf1.teamB += points;
              }
              break;
            case 4:
              if (team === 'A') {
                quarterScores.secondHalf2.teamA += points;
              } else {
                quarterScores.secondHalf2.teamB += points;
              }
              break;
          }
        }
      });
    }

    return quarterScores;
  };

  const quarterScores = calculateQuarterScores();

  // 计算总分
  const totalScores = {
    teamA: quarterScores.firstHalf1.teamA + quarterScores.firstHalf2.teamA +
           quarterScores.secondHalf1.teamA + quarterScores.secondHalf2.teamA,
    teamB: quarterScores.firstHalf1.teamB + quarterScores.firstHalf2.teamB +
           quarterScores.secondHalf1.teamB + quarterScores.secondHalf2.teamB
  };

  const handleStarterChange = async (playerId: string, isStarter: boolean) => {
    try {
      const response = await fetch(`/api/matches/${match.id}/players/${playerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isStarter }),
      });

      if (!response.ok) {
        throw new Error('更新首发状态失败');
      }

      // 刷新页面以显示更新后的状态
      window.location.reload();
    } catch (error) {
      console.error('更新首发状态失败:', error);
      alert('操作失败，请重试');
    }
  };

  return (
    <ScoreSheetContainer>
      <Header>
        <h1>篮球比赛记录表</h1>
        <p>（{match.quarterLength}分钟 × 4）</p>
      </Header>

      <InfoGrid>
        <div>甲队：{match.teamA}</div>
        <div>乙队：{match.teamB}</div>
        <div>比赛名称：{match.name}</div>
        <div>日期：{match.date}</div>
        <div>时间：{match.time || ''}</div>
        <div>地点：{match.location || ''}</div>
        <div>主裁判：{match.mainReferee || ''}</div>
        <div>副裁判：{match.assistantReferee || ''}</div>
        <div>比赛用时：{formatGameTime(matchData.time)}</div>
      </InfoGrid>

      <TeamSection>
        <h3>甲队</h3>
        <ScoreTable>
          <thead>
            <tr>
              <th>队员姓名</th>
              <th>号码</th>
              <th>个人犯规</th>
              <th>首发</th>
            </tr>
          </thead>
          <tbody>
            {getTeamPlayers('A').map(player => {
              const fouls = calculatePlayerFouls(`${player.number}号 ${player.name}`, 'A');
              return (
                <tr key={player.id}>
                  <td>{player.name}{player.isStarter ? '（首发）' : ''}</td>
                  <td>{player.number}</td>
                  <td>{fouls}</td>
                  <td>
                    <Switch
                      checked={player.isStarter}
                      onChange={(checked) => handleStarterChange(player.id, checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </ScoreTable>
      </TeamSection>

      <TeamSection>
        <h3>乙队</h3>
        <ScoreTable>
          <thead>
            <tr>
              <th>队员姓名</th>
              <th>号码</th>
              <th>个人犯规</th>
              <th>首发</th>
            </tr>
          </thead>
          <tbody>
            {getTeamPlayers('B').map(player => {
              const fouls = calculatePlayerFouls(`${player.number}号 ${player.name}`, 'B');
              return (
                <tr key={player.id}>
                  <td>{player.name}{player.isStarter ? '（首发）' : ''}</td>
                  <td>{player.number}</td>
                  <td>{fouls}</td>
                  <td>
                    <Switch
                      checked={player.isStarter}
                      onChange={(checked) => handleStarterChange(player.id, checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </ScoreTable>
      </TeamSection>

      <div>
        <h3>比分记录</h3>
        <ScoreTable>
          <thead>
            <tr>
              <th>节次</th>
              <th>甲队</th>
              <th>乙队</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>第一节</td>
              <td>{quarterScores.firstHalf1.teamA}</td>
              <td>{quarterScores.firstHalf1.teamB}</td>
            </tr>
            <tr>
              <td>第二节</td>
              <td>{quarterScores.firstHalf2.teamA}</td>
              <td>{quarterScores.firstHalf2.teamB}</td>
            </tr>
            <tr>
              <td>第三节</td>
              <td>{quarterScores.secondHalf1.teamA}</td>
              <td>{quarterScores.secondHalf1.teamB}</td>
            </tr>
            <tr>
              <td>第四节</td>
              <td>{quarterScores.secondHalf2.teamA}</td>
              <td>{quarterScores.secondHalf2.teamB}</td>
            </tr>
            <tr>
              <td>总分</td>
              <td>{totalScores.teamA}</td>
              <td>{totalScores.teamB}</td>
            </tr>
          </tbody>
        </ScoreTable>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>教练员：{match.coachA || ''} / {match.coachB || ''}</p>
        <p>助理教练员：{match.assistantCoachA || ''} / {match.assistantCoachB || ''}</p>
      </div>
    </ScoreSheetContainer>
  );
};

export default MatchScoreSheet;