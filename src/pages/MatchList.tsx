import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MatchScoreSheet from '../components/MatchScoreSheet';
import { Match } from '../types';

const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loadMatches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/matches');
      setMatches(response.data);
    } catch (error) {
      message.error('加载比赛列表失败');
    }
  };

  const loadMatchPlayers = async (matchId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/matches/${matchId}/players`);
      return response.data;
    } catch (error) {
      message.error('加载球员列表失败');
      return [];
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      const response = await axios.post('http://localhost:3000/matches', values);
      message.success('创建比赛成功');
      setModalVisible(false);
      loadMatches();
      return response.data;
    } catch (error) {
      message.error('创建比赛失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/matches/${id}`);
      message.success('删除比赛成功');
      loadMatches();
    } catch (error) {
      message.error('删除比赛失败');
    }
  };

  const handleView = async (record: Match) => {
    setCurrentMatch(record);
    await loadMatchPlayers(record.id);
    setIsViewModalVisible(true);
  };

  const columns = [
    { title: '比赛名称', dataIndex: 'name' },
    { title: '日期', dataIndex: 'date' },
    { title: 'A队', dataIndex: 'teamA' },
    { title: 'B队', dataIndex: 'teamB' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Match) => (
        <Space>
          <Button onClick={() => handleView(record)}>查看</Button>
          <Button onClick={() => navigate(`/match/${record.id}/players`)}>
            球员管理
          </Button>
          <Button type="primary" onClick={() => navigate(`/match/${record.id}/record`)}>
            开始比赛
          </Button>
          <Popconfirm
            title="确定要删除这场比赛吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button
        type="primary"
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        新建比赛
      </Button>

      <Table columns={columns} dataSource={matches} rowKey="id" />

      <Modal
        title="新建比赛"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="比赛名称"
            rules={[{ required: true, message: '请输入比赛名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="比赛日期"
            rules={[{ required: true, message: '请选择比赛日期' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="time"
            label="比赛时间"
          >
            <Input type="time" />
          </Form.Item>
          <Form.Item
            name="location"
            label="比赛地点"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teamA"
            label="A队名称"
            rules={[{ required: true, message: '请输入A队名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teamB"
            label="B队名称"
            rules={[{ required: true, message: '请输入B队名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="mainReferee"
            label="主裁判"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="assistantReferee"
            label="副裁判"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="coachA"
            label="A队教练"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="coachB"
            label="B队教练"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="assistantCoachA"
            label="A队助理教练"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="assistantCoachB"
            label="B队助理教练"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quarterLength"
            label="每节时长(分钟)"
            initialValue={10}
            rules={[{ required: true, message: '请输入每节比赛时长' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="比赛记录表"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentMatch && (
          <MatchScoreSheet match={currentMatch} players={[]} events={[]} />
        )}
      </Modal>
    </div>
  );
};

export default MatchList;