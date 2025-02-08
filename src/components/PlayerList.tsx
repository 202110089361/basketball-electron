import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm } from 'antd';
import { Player } from '../types/player';
import { playerService } from '../services/playerService';
import PlayerModal from './PlayerModal';

const PlayerList: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // 加载球员数据
  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await playerService.getAllPlayers();
      setPlayers(data);
    } catch (error) {
      message.error('加载球员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // 删除球员
  const handleDelete = async (id: string) => {
    try {
      await playerService.deletePlayer(id);
      message.success('删除成功');
      loadPlayers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 编辑球员
  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setModalVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '球衣号码',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: '球队',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Player) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个球员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          添加球员
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={players}
        rowKey="id"
        loading={loading}
      />
      <PlayerModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPlayer(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingPlayer(null);
          loadPlayers();
        }}
        player={editingPlayer}
      />
    </div>
  );
};

export default PlayerList;