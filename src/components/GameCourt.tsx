import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Space, Typography, Table, Select, message, Modal, Input, Form, Tabs } from 'antd';
import { PlusOutlined, MinusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTimer } from '../hooks/useTimer';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface TeamScore {
  points: number;
  fouls: number;
  timeouts: number;
}

interface Quarter {
  id: number;
  name: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface Player {
  id: string;
  name: string;
  number: string;
  team: 'A' | 'B';
  isStarter?: boolean;
}

interface GameEvent {
  id: number;
  time: string;
  type: string;
  team: 'A' | 'B';
  player: string;
  points?: number;
  attempts?: number;
  made?: number;
  position?: { x: number; y: number };
  description?: string;
  quarter?: number;
}

interface EventMarker {
  x: number;
  y: number;
  team: 'A' | 'B';
  type: string;
  id: number;
}

interface GameCourtProps {
  matchId: string;
}

interface SubstitutionData {
  team: 'A' | 'B';
  inPlayer: string;
  outPlayer: string;
}

const GameCourt: React.FC<GameCourtProps> = ({ matchId }) => {
  // 从 localStorage 加载数据或使用初始值
  const loadFromStorage = (key: string, defaultValue: any) => {
    const stored = localStorage.getItem(`match_${matchId}_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  // 保存数据到 localStorage
  const saveToStorage = (key: string, value: any) => {
    localStorage.setItem(`match_${matchId}_${key}`, JSON.stringify(value));
  };

  const { time, rawTime, isRunning, start, pause, reset } = useTimer(loadFromStorage('rawTime', 0));
  const [teamA, setTeamA] = useState<TeamScore>(() =>
    loadFromStorage('teamA', { points: 0, fouls: 0, timeouts: 0 })
  );
  const [teamB, setTeamB] = useState<TeamScore>(() =>
    loadFromStorage('teamB', { points: 0, fouls: 0, timeouts: 0 })
  );
  const [events, setEvents] = useState<GameEvent[]>(() =>
    loadFromStorage('events', [])
  );
  const [eventId, setEventId] = useState(() =>
    loadFromStorage('eventId', 1)
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerA, setSelectedPlayerA] = useState<string>('');
  const [selectedPlayerB, setSelectedPlayerB] = useState<string>('');
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [markers, setMarkers] = useState<EventMarker[]>(() =>
    loadFromStorage('markers', [])
  );
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [quarters, setQuarters] = useState<Quarter[]>(() => loadFromStorage('quarters', [
    { id: 1, name: '第一节', isActive: false, isCompleted: false },
    { id: 2, name: '第二节', isActive: false, isCompleted: false },
    { id: 3, name: '第三节', isActive: false, isCompleted: false },
    { id: 4, name: '第四节', isActive: false, isCompleted: false }
  ]));
  const [activePlayers, setActivePlayers] = useState<{ [key: string]: string[] }>(() =>
    loadFromStorage('activePlayers', { A: [], B: [] })
  );
  const [isSubstitutionModalVisible, setIsSubstitutionModalVisible] = useState(false);
  const [substitutionData, setSubstitutionData] = useState<SubstitutionData>({
    team: 'A',
    inPlayer: '',
    outPlayer: ''
  });
  const [match, setMatch] = useState<{ teamA: string; teamB: string } | null>(null);

  // 使用 useEffect 监听数据变化并保存
  useEffect(() => {
    saveToStorage('teamA', teamA);
  }, [teamA, matchId]);

  useEffect(() => {
    saveToStorage('teamB', teamB);
  }, [teamB, matchId]);

  useEffect(() => {
    saveToStorage('events', events);
  }, [events, matchId]);

  useEffect(() => {
    saveToStorage('eventId', eventId);
  }, [eventId, matchId]);

  useEffect(() => {
    saveToStorage('markers', markers);
  }, [markers, matchId]);

  useEffect(() => {
    saveToStorage('time', time);
    saveToStorage('rawTime', rawTime);
  }, [time, rawTime, matchId]);

  useEffect(() => {
    saveToStorage('quarters', quarters);
  }, [quarters, matchId]);

  useEffect(() => {
    saveToStorage('activePlayers', activePlayers);
  }, [activePlayers, matchId]);

  useEffect(() => {
    loadPlayers();
  }, [matchId]);

  useEffect(() => {
    // 初始化场上球员
    const initializeActivePlayers = () => {
      const storedActivePlayers = loadFromStorage('activePlayers', null);
      if (storedActivePlayers) {
        setActivePlayers(storedActivePlayers);
        return;
      }

      const activeA = players
        .filter(p => p.team === 'A' && p.isStarter)
        .map(p => p.id);
      const activeB = players
        .filter(p => p.team === 'B' && p.isStarter)
        .map(p => p.id);
      setActivePlayers({ A: activeA, B: activeB });
    };

    if (players.length > 0) {
      initializeActivePlayers();
    }
  }, [players]);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/matches/${matchId}`);
        setMatch(response.data);
      } catch (error) {
        message.error('加载比赛信息失败');
      }
    };
    loadMatch();
  }, [matchId]);

  const loadPlayers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/matches/${matchId}/players`);
      setPlayers(response.data);
    } catch (error) {
      message.error('加载球员列表失败');
    }
  };

  const handleQuarterAction = (quarterId: number, action: 'start' | 'complete') => {
    setQuarters(prev => prev.map(q => {
      if (q.id === quarterId) {
        if (action === 'start') {
          return { ...q, isActive: true };
        } else {
          return { ...q, isActive: false, isCompleted: true };
        }
      }
      if (action === 'start') {
        return { ...q, isActive: false };
      }
      return q;
    }));
  };

  const getCurrentQuarter = () => {
    return quarters.find(q => q.isActive)?.id || 0;
  };

  const addScoringEvent = (team: 'A' | 'B', points: number) => {
    const selectedPlayer = team === 'A' ? selectedPlayerA : selectedPlayerB;
    if (!selectedPlayer) {
      message.warning('请先选择球员');
      return;
    }

    const player = players.find(p => p.id === selectedPlayer);
    if (!player) return;

    if (!clickPosition) {
      message.warning('请先在球场上点击得分位置');
      return;
    }

    const newEvent: GameEvent = {
      id: eventId,
      time,
      type: '得分',
      team,
      player: `${player.number}号 ${player.name}`,
      points,
      position: clickPosition,
      description: `${points}分命中`,
      quarter: getCurrentQuarter()
    };

    // 添加得分标记
    setMarkers(prev => [...prev, {
      x: clickPosition.x,
      y: clickPosition.y,
      team,
      type: '得分',
      id: eventId
    }]);

    setEvents((prev: GameEvent[]) => [newEvent, ...prev]);
    setEventId((prev: number) => prev + 1);
    if (team === 'A') {
      setTeamA(prev => ({ ...prev, points: prev.points + points }));
    } else {
      setTeamB(prev => ({ ...prev, points: prev.points + points }));
    }
    setClickPosition(null);
  };

  const addFreeThrowEvent = async (team: 'A' | 'B') => {
    const selectedPlayer = team === 'A' ? selectedPlayerA : selectedPlayerB;
    if (!selectedPlayer) {
      message.warning('请先选择球员');
      return;
    }

    const player = players.find(p => p.id === selectedPlayer);
    if (!player) return;

    Modal.confirm({
      title: '罚球记录',
      content: (
        <div>
          <p>请输入罚球次数和命中数：</p>
          <Input.Group compact>
            <Input
              id="attempts"
              style={{ width: '50%' }}
              placeholder="罚球次数"
              type="number"
            />
            <Input
              id="made"
              style={{ width: '50%' }}
              placeholder="命中数"
              type="number"
            />
          </Input.Group>
        </div>
      ),
      onOk: () => {
        const attemptsInput = document.getElementById('attempts') as HTMLInputElement;
        const madeInput = document.getElementById('made') as HTMLInputElement;
        const attempts = parseInt(attemptsInput.value);
        const made = parseInt(madeInput.value);

        if (isNaN(attempts) || isNaN(made) || attempts < made || attempts <= 0) {
          message.error('请输入有效的罚球数据');
          return;
        }

        const newEvent: GameEvent = {
          id: eventId,
          time,
          type: '罚球',
          team,
          player: `${player.number}号 ${player.name}`,
          attempts,
          made,
          points: made,
          description: `罚球${made}/${attempts}`,
          quarter: getCurrentQuarter()
        };

        setEvents((prev: GameEvent[]) => [newEvent, ...prev]);
        setEventId((prev: number) => prev + 1);
        if (team === 'A') {
          setTeamA(prev => ({ ...prev, points: prev.points + made }));
        } else {
          setTeamB(prev => ({ ...prev, points: prev.points + made }));
        }
      }
    });
  };

  const getMarkerStyle = (type: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 16,
      height: 16,
      transform: 'translate(-50%, -50%)'
    };

    switch (type) {
      case '得分':
        return {
          ...baseStyle,
          borderRadius: '50%',
          border: '2px solid',
          backgroundColor: 'white'
        };
      case '盖帽':
        return {
          ...baseStyle,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          backgroundColor: 'transparent',
          border: '2px solid'
        };
      case '抢断':
        return {
          ...baseStyle,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          width: 12,
          height: 12,
          backgroundColor: 'currentColor'
        };
      case '助攻':
        return {
          ...baseStyle,
          borderRadius: '50% 50% 50% 0',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          backgroundColor: 'currentColor'
        };
      case '防守犯规':
      case '进攻犯规':
      case '技术犯规':
        return {
          ...baseStyle,
          borderRadius: '2px',
          backgroundColor: 'currentColor'
        };
      case '防守篮板':
      case '进攻篮板':
        return {
          ...baseStyle,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          border: '2px solid',
          backgroundColor: 'transparent'
        };
      default:
        return {
          ...baseStyle,
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        };
    }
  };

  const addEvent = (type: string, team: 'A' | 'B', position?: { x: number; y: number }) => {
    const selectedPlayer = team === 'A' ? selectedPlayerA : selectedPlayerB;
    if (!selectedPlayer) {
      message.warning('请先选择球员');
      return;
    }

    const player = players.find(p => p.id === selectedPlayer);
    if (!player) return;

    let description = type;
    switch (type) {
      case '盖帽':
        description = '成功盖帽';
        break;
      case '失误':
        description = '失误';
        break;
      case '抢断':
        description = '成功抢断';
        break;
      case '助攻':
        description = '助攻得分';
        break;
      case '防守犯规':
      case '进攻犯规':
      case '技术犯规':
        description = type;
        if (team === 'A') {
          setTeamA(prev => ({ ...prev, fouls: prev.fouls + 1 }));
        } else {
          setTeamB(prev => ({ ...prev, fouls: prev.fouls + 1 }));
        }
        break;
      case '被侵':
        description = '被侵犯';
        break;
      case '防守篮板':
        description = '防守篮板';
        break;
      case '进攻篮板':
        description = '进攻篮板';
        break;
      case '长暂停':
        description = '请求暂停';
        break;
    }

    const newEvent: GameEvent = {
      id: eventId,
      time,
      type,
      team,
      player: `${player.number}号 ${player.name}`,
      position,
      description,
      quarter: getCurrentQuarter()
    };

    if (position) {
      setMarkers(prev => [...prev, {
        x: position.x,
        y: position.y,
        team,
        type,
        id: eventId
      }]);
    }

    setEvents((prev: GameEvent[]) => [newEvent, ...prev]);
    setEventId((prev: number) => prev + 1);
    setClickPosition(null);
  };

  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClickPosition({ x, y });
  };

  const columns = [
    { title: '时间', dataIndex: 'time', width: 100 },
    { title: '节次', dataIndex: 'quarter', width: 80, render: (quarter: number) => `第${quarter}节` },
    { title: '球队', dataIndex: 'team', width: 80, render: (team: string) => team === 'A' ? 'A队' : 'B队' },
    { title: '球员', dataIndex: 'player', width: 120 },
    { title: '类型', dataIndex: 'type', width: 100 },
    {
      title: '详情',
      dataIndex: 'description',
      width: 120,
      render: (_: any, record: GameEvent) => {
        if (record.type === '得分') {
          return `${record.points}分命中`;
        } else if (record.type === '罚球') {
          return `${record.made}/${record.attempts}`;
        }
        return record.description;
      }
    }
  ];

  // 添加图例说明组件
  const LegendItem = ({ color, shape, description }: { color: string; shape: React.CSSProperties; description: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <div
        style={{
          ...shape,
          position: 'static',
          marginRight: 8,
          color: color,
          borderColor: color
        }}
      />
      <span>{description}</span>
    </div>
  );

  const renderHelpModal = () => (
    <div
      style={{
        position: 'absolute',
        right: 20,
        top: 20,
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: isHelpModalVisible ? 'block' : 'none',
        width: '250px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0 }}>图例说明</h4>
        <Button
          type="text"
          size="small"
          onClick={() => setIsHelpModalVisible(false)}
        >
          关闭
        </Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h4>队伍颜色：</h4>
        <LegendItem
          color="#f5222d"
          shape={getMarkerStyle('default')}
          description="A队 - 红色"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('default')}
          description="B队 - 蓝色"
        />
      </div>
      <div>
        <h4>事件类型：</h4>
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('得分')}
          description="得分 - 空心圆形"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('盖帽')}
          description="盖帽 - 空心方形（旋转45度）"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('抢断')}
          description="抢断 - 实心菱形"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('助攻')}
          description="助攻 - 箭头形状"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('防守犯规')}
          description="犯规 - 实心方形"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('防守篮板')}
          description="篮板 - 空心菱形"
        />
        <LegendItem
          color="#1890ff"
          shape={getMarkerStyle('失误')}
          description="其他事件 - 实心圆形"
        />
      </div>
    </div>
  );

  const resetAll = () => {
    if (window.confirm('确定要重置所有比赛数据吗？')) {
      // 清除所有相关的 localStorage 数据
      localStorage.removeItem(`match_${matchId}_teamA`);
      localStorage.removeItem(`match_${matchId}_teamB`);
      localStorage.removeItem(`match_${matchId}_events`);
      localStorage.removeItem(`match_${matchId}_eventId`);
      localStorage.removeItem(`match_${matchId}_markers`);
      localStorage.removeItem(`match_${matchId}_time`);
      localStorage.removeItem(`match_${matchId}_activePlayers`);

      // 重置所有状态
      setTeamA({ points: 0, fouls: 0, timeouts: 0 });
      setTeamB({ points: 0, fouls: 0, timeouts: 0 });
      setEvents([]);
      setEventId(1);
      setMarkers([]);
      setActivePlayers({ A: [], B: [] });
      reset();
    }
  };

  const handleSubstitution = (team: 'A' | 'B', inPlayerId: string, outPlayerId: string) => {
    // 记录换人事件
    const inPlayer = players.find(p => p.id === inPlayerId);
    const outPlayer = players.find(p => p.id === outPlayerId);
    if (!inPlayer || !outPlayer) return;

    const newEvent: GameEvent = {
      id: eventId,
      time,
      type: '换人',
      team,
      player: `${outPlayer.number}号 ${outPlayer.name} 换下，${inPlayer.number}号 ${inPlayer.name} 换上`,
      description: '换人',
      quarter: getCurrentQuarter()
    };

    setEvents((prev: GameEvent[]) => [newEvent, ...prev]);
    setEventId((prev: number) => prev + 1);

    // 更新场上球员
    setActivePlayers(prev => {
      const newActivePlayers = { ...prev };
      // 如果是首发球员，将其从首发名单中移除
      const outPlayerData = players.find(p => p.id === outPlayerId);
      if (outPlayerData) {
        outPlayerData.isStarter = false;
      }
      // 更新当前队伍的场上球员名单
      newActivePlayers[team] = prev[team].filter(id => id !== outPlayerId);
      if (!newActivePlayers[team].includes(inPlayerId)) {
        newActivePlayers[team].push(inPlayerId);
      }
      return newActivePlayers;
    });

    // 重置换人数据
    setSubstitutionData({ team: 'A', inPlayer: '', outPlayer: '' });
    setIsSubstitutionModalVisible(false);
  };

  const handleSubstitutionConfirm = () => {
    if (substitutionData.inPlayer && substitutionData.outPlayer) {
      handleSubstitution(
        substitutionData.team,
        substitutionData.inPlayer,
        substitutionData.outPlayer
      );
    }
    setIsSubstitutionModalVisible(false);
  };

  const renderPlayerSelect = (team: 'A' | 'B') => {
    const teamPlayers = players.filter(p => p.team === team);
    // 获取场上球员（包括首发和已经通过换人上场的球员）
    const activeTeamPlayers = teamPlayers.filter(p =>
      p.isStarter || activePlayers[team]?.includes(p.id)
    );
    // 获取场下球员（既不是首发也不在场上的球员）
    const benchPlayers = teamPlayers.filter(p =>
      !p.isStarter && !activePlayers[team]?.includes(p.id)
    );

    return (
      <div>
        <Form.Item label="场上球员">
          <Select
            style={{ width: '100%' }}
            value={substitutionData.outPlayer}
            onChange={(value) => setSubstitutionData(prev => ({ ...prev, outPlayer: value }))}
          >
            {activeTeamPlayers.map(player => (
              <Select.Option key={player.id} value={player.id}>
                {player.number}号 {player.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="替补球员">
          <Select
            style={{ width: '100%' }}
            value={substitutionData.inPlayer}
            onChange={(value) => setSubstitutionData(prev => ({ ...prev, inPlayer: value }))}
          >
            {benchPlayers.map(player => (
              <Select.Option key={player.id} value={player.id}>
                {player.number}号 {player.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col span={24}>
          <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
            {quarters.map(quarter => (
              <div key={quarter.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: quarter.isActive ? '#e6f7ff' : quarter.isCompleted ? '#f6ffed' : 'transparent',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #d9d9d9'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{quarter.name}</span>
                <Space>
                  <Button
                    type={quarter.isActive ? 'primary' : 'default'}
                    onClick={() => handleQuarterAction(quarter.id, 'start')}
                    disabled={quarter.isCompleted}
                    style={{ width: '80px' }}
                  >
                    {quarter.isActive ? '进行中' : '开始'}
                  </Button>
                  <Button
                    type={quarter.isCompleted ? 'primary' : 'default'}
                    onClick={() => handleQuarterAction(quarter.id, 'complete')}
                    disabled={!quarter.isActive}
                    style={{ width: '80px' }}
                  >
                    {quarter.isCompleted ? '已完成' : '完成'}
                  </Button>
                </Space>
              </div>
            ))}
          </Space>
        </Col>
      </Row>

      <Row justify="space-between" align="middle">
        <Col span={8}>
          <Title level={2}>{match?.teamA || 'A队'}</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={1}>{teamA.points}</Title>
              <div style={{ marginBottom: 16 }}>
                <Select
                  style={{ width: '200px', marginRight: '8px' }}
                  value={selectedPlayerA}
                  onChange={setSelectedPlayerA}
                  placeholder="选择A队球员"
                >
                  {players
                    .filter(p => p.team === 'A' && (p.isStarter || activePlayers['A']?.includes(p.id)))
                    .map(player => (
                      <Option key={player.id} value={player.id}>
                        {player.number}号 {player.name}
                      </Option>
                    ))}
                </Select>
                <Button
                  onClick={() => setIsSubstitutionModalVisible(true)}
                  style={{ marginLeft: '8px' }}
                >
                  换人
                </Button>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addScoringEvent('A', 1)}
                >
                  加1分
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addScoringEvent('A', 2)}
                >
                  加2分
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addScoringEvent('A', 3)}
                >
                  加3分
                </Button>
                <Button
                  danger
                  icon={<MinusOutlined />}
                  onClick={() => setTeamA(prev => ({ ...prev, points: Math.max(0, prev.points - 1) }))}
                >
                  减1分
                </Button>
                <Button
                  type="primary"
                  onClick={() => addFreeThrowEvent('A')}
                >
                  罚球
                </Button>
              </Space>
            </div>
            <div>
              <span>长暂停：{teamA.timeouts}</span>
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => {
                  setTeamA(prev => ({ ...prev, timeouts: prev.timeouts + 1 }));
                  addEvent('长暂停', 'A');
                }}
              />
            </div>
            <div>
              <span>犯规：{teamA.fouls}</span>
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => {
                  setTeamA(prev => ({ ...prev, fouls: prev.fouls + 1 }));
                  addEvent('犯规', 'A');
                }}
              />
            </div>
          </Space>
        </Col>

        <Col span={8} style={{ textAlign: 'center' }}>
          <Title level={1}>{time}</Title>
          <Space>
            <Button onClick={isRunning ? pause : start}>
              {isRunning ? '暂停' : '开始'}
            </Button>
            <Button onClick={reset}>重置时间</Button>
            <Button danger onClick={resetAll}>重置比赛</Button>
          </Space>
        </Col>

        <Col span={8} style={{ textAlign: 'right' }}>
          <Title level={2}>{match?.teamB || 'B队'}</Title>
          <Space direction="vertical" size="large" style={{ width: '100%', alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={1}>{teamB.points}</Title>
              <div style={{ marginBottom: 16 }}>
                <Select
                  style={{ width: '200px', marginRight: '8px' }}
                  value={selectedPlayerB}
                  onChange={setSelectedPlayerB}
                  placeholder="选择B队球员"
                >
                  {players
                    .filter(p => p.team === 'B' && (p.isStarter || activePlayers['B']?.includes(p.id)))
                    .map(player => (
                      <Option key={player.id} value={player.id}>
                        {player.number}号 {player.name}
                      </Option>
                    ))}
                </Select>
                <Button
                  onClick={() => {
                    setSubstitutionData(prev => ({ ...prev, team: 'B' }));
                    setIsSubstitutionModalVisible(true);
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  换人
                </Button>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addScoringEvent('B', 1)}
                >
                  加1分
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addScoringEvent('B', 2)}
                >
                  加2分
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addScoringEvent('B', 3)}
                >
                  加3分
                </Button>
                <Button
                  danger
                  icon={<MinusOutlined />}
                  onClick={() => setTeamB(prev => ({ ...prev, points: Math.max(0, prev.points - 1) }))}
                >
                  减1分
                </Button>
                <Button
                  type="primary"
                  onClick={() => addFreeThrowEvent('B')}
                >
                  罚球
                </Button>
              </Space>
            </div>
            <div>
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => {
                  setTeamB(prev => ({ ...prev, timeouts: prev.timeouts + 1 }));
                  addEvent('长暂停', 'B');
                }}
              />
              <span>长暂停：{teamB.timeouts}</span>
            </div>
            <div>
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => {
                  setTeamB(prev => ({ ...prev, fouls: prev.fouls + 1 }));
                  addEvent('犯规', 'B');
                }}
              />
              <span>犯规：{teamB.fouls}</span>
            </div>
          </Space>
        </Col>
      </Row>

      <Row style={{ marginTop: 20 }}>
        <Col span={3} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingRight: '8px',
          height: '100%',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('盖帽', 'A', clickPosition)}>A队盖帽</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('失误', 'A', clickPosition)}>A队失误</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('抢断', 'A', clickPosition)}>A队抢断</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('助攻', 'A', clickPosition)}>A队助攻</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('防守犯规', 'A', clickPosition)}>A队防守犯规</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('进攻犯规', 'A', clickPosition)}>A队进攻犯规</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('技术犯规', 'A', clickPosition)}>A队技术犯规</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('被侵', 'A', clickPosition)}>A队被侵</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('防守篮板', 'A', clickPosition)}>A队防守篮板</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('进攻篮板', 'A', clickPosition)}>A队进攻篮板</Button>
          </div>
        </Col>

        <Col span={18}>
          <div
            style={{
              width: '100%',
              paddingTop: '56.25%', // 16:9的宽高比
              position: 'relative',
              maxWidth: '1200px',
              margin: '0 auto',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              onClick={() => setIsHelpModalVisible(!isHelpModalVisible)}
              style={{
                position: 'absolute',
                right: 20,
                top: 20,
                zIndex: 1001,
                background: 'white'
              }}
            >
              图例说明
            </Button>
            {renderHelpModal()}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url('/basketball-court.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'crosshair',
                backgroundColor: '#fff'
              }}
              onClick={handleCourtClick}
            >
              {markers.map(marker => (
                <div
                  key={marker.id}
                  style={{
                    ...getMarkerStyle(marker.type),
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    color: marker.team === 'A' ? '#f5222d' : '#1890ff',
                    borderColor: marker.team === 'A' ? '#f5222d' : '#1890ff'
                  }}
                  title={`${marker.team}队 ${marker.type}`}
                />
              ))}

              {clickPosition && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${clickPosition.x}%`,
                    top: `${clickPosition.y}%`,
                    width: 16,
                    height: 16,
                    border: '2px solid #000',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
          </div>
        </Col>

        <Col span={3} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingLeft: '8px',
          height: '100%',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('盖帽', 'B', clickPosition)}>B队盖帽</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('失误', 'B', clickPosition)}>B队失误</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('抢断', 'B', clickPosition)}>B队抢断</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('助攻', 'B', clickPosition)}>B队助攻</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('防守犯规', 'B', clickPosition)}>B队防守犯规</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('进攻犯规', 'B', clickPosition)}>B队进攻犯规</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('技术犯规', 'B', clickPosition)}>B队技术犯规</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('被侵', 'B', clickPosition)}>B队被侵</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('防守篮板', 'B', clickPosition)}>B队防守篮板</Button>
            <Button size="middle" style={{ fontSize: '14px', height: '32px' }} onClick={() => clickPosition && addEvent('进攻篮板', 'B', clickPosition)}>B队进攻篮板</Button>
          </div>
        </Col>
      </Row>

      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={events}
            rowKey="id"
            pagination={false}
            scroll={{ y: 300 }}
            size="small"
            rowClassName={(record: GameEvent) => {
              switch (record.quarter) {
                case 1:
                  return 'first-quarter-row';
                case 2:
                  return 'second-quarter-row';
                case 3:
                  return 'third-quarter-row';
                case 4:
                  return 'fourth-quarter-row';
                default:
                  return '';
              }
            }}
          />
        </Col>
      </Row>

      <style>
        {`
          .first-quarter-row {
            background-color: #ffffff;
          }
          .second-quarter-row {
            background-color: #f5f5f5;
          }
          .third-quarter-row {
            background-color: #ffffff;
          }
          .fourth-quarter-row {
            background-color: #f5f5f5;
          }
          .first-quarter-row:hover,
          .second-quarter-row:hover,
          .third-quarter-row:hover,
          .fourth-quarter-row:hover {
            background-color: #e6f7ff !important;
          }
        `}
      </style>

      <Modal
        title="换人"
        open={isSubstitutionModalVisible}
        onOk={handleSubstitutionConfirm}
        onCancel={() => {
          setIsSubstitutionModalVisible(false);
          setSubstitutionData({ team: 'A', inPlayer: '', outPlayer: '' });
        }}
      >
        <Tabs
          activeKey={substitutionData.team}
          onChange={(key) => {
            if (key === 'A' || key === 'B') {
              setSubstitutionData(prev => ({ ...prev, team: key, inPlayer: '', outPlayer: '' }));
            }
          }}
          items={[
            {
              key: 'A',
              label: match?.teamA || 'A队',
              children: renderPlayerSelect('A')
            },
            {
              key: 'B',
              label: match?.teamB || 'B队',
              children: renderPlayerSelect('B')
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default GameCourt;