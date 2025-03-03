import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, Row, Col, Switch } from 'antd';
import { useParams } from 'react-router-dom';
import axios from 'axios';


interface Player {
  id: string;
  name: string;
  number: string;
  team: 'A' | 'B';
  isStarter?: boolean;
}

interface Match {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
}

const MatchPlayers: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadMatch = async () => {
    try {
      const response = await axios.get(`/api/matches/${matchId}`);
      setMatch(response.data);
    } catch (error) {
      message.error('加载比赛信息失败');
    }
  };

  const loadPlayers = async () => {
    try {
      const response = await axios.get(`/api/matches/${matchId}/players`);
      setPlayers(response.data);
    } catch (error) {
      message.error('加载球员列表失败');
    }
  };

  useEffect(() => {
    if (matchId) {
      loadMatch();
      loadPlayers();
    }
  }, [matchId]);

  const handleAddPlayer = async (values: any) => {
    try {
      await axios.post(`/api/matches/${matchId}/players`, {
        ...values,
        isStarter: false
      });
      message.success('添加球员成功');
      setIsModalVisible(false);
      loadPlayers();
      form.resetFields();
    } catch (error) {
      message.error('添加球员失败');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await axios.delete(`/api/matches/${matchId}/players/${playerId}`);
      message.success('删除球员成功');
      loadPlayers();
    } catch (error) {
      message.error('删除球员失败');
    }
  };

  const handleStarterChange = async (playerId: string, isStarter: boolean, team: 'A' | 'B') => {
    const currentStarters = players.filter(p => p.team === team && p.isStarter).length;

    if (isStarter && currentStarters >= 5) {
      message.error('每队最多只能有5名首发球员');
      return;
    }

    try {
      await axios.patch(`/api/matches/${matchId}/players/${playerId}`, {
        isStarter
      });
      message.success(`${isStarter ? '设置' : '取消'}首发成功`);
      loadPlayers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: '球衣号码', dataIndex: 'number', width: 100 },
    { title: '姓名', dataIndex: 'name' },
    {
      title: '首发',
      dataIndex: 'isStarter',
      width: 100,
      render: (isStarter: boolean, record: Player) => (
        <Switch
          checked={isStarter}
          onChange={(checked) => handleStarterChange(record.id, checked, record.team)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Player) => (
        <Button danger onClick={() => handleDeletePlayer(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  if (!match) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>{match.name} - 球员管理</h2>

      <Row gutter={24}>
        <Col span={12}>
          <Card
            title={`${match.teamA}队球员`}
            extra={
              <div>
                首发球员: {players.filter(p => p.team === 'A' && p.isStarter).length}/5
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => {
                form.setFieldsValue({ team: 'A' });
                setIsModalVisible(true);
              }}
              style={{ marginBottom: 16 }}
            >
              添加球员
            </Button>
            <Table
              columns={columns}
              dataSource={players.filter(p => p.team === 'A')}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={`${match.teamB}队球员`}
            extra={
              <div>
                首发球员: {players.filter(p => p.team === 'B' && p.isStarter).length}/5
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => {
                form.setFieldsValue({ team: 'B' });
                setIsModalVisible(true);
              }}
              style={{ marginBottom: 16 }}
            >
              添加球员
            </Button>
            <Table
              columns={columns}
              dataSource={players.filter(p => p.team === 'B')}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="添加球员"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} onFinish={handleAddPlayer}>
          <Form.Item name="team" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="number"
            label="球衣号码"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="球员姓名"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchPlayers;