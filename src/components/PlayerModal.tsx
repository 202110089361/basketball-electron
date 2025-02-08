import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { Player, CreatePlayerDto } from '../types/player';
import { playerService } from '../services/playerService';

interface PlayerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  player?: Player | null;
}

const PlayerModal: React.FC<PlayerModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  player
}) => {
  const [form] = Form.useForm();

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (player) {
        // 更新球员
        await playerService.updatePlayer(player.id, values);
        message.success('更新成功');
      } else {
        // 创建新球员
        await playerService.createPlayer(values as CreatePlayerDto);
        message.success('创建成功');
      }
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error(player ? '更新失败' : '创建失败');
    }
  };

  // 当模态框打开时，如果是编辑模式，设置表单初始值
  React.useEffect(() => {
    if (visible && player) {
      form.setFieldsValue({
        name: player.name,
        number: player.number,
        team: player.team
      });
    } else {
      form.resetFields();
    }
  }, [visible, player, form]);

  return (
    <Modal
      title={player ? '编辑球员' : '添加球员'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: '', number: '', team: '' }}
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入球员姓名' }]}
        >
          <Input placeholder="请输入球员姓名" />
        </Form.Item>
        <Form.Item
          name="number"
          label="球衣号码"
          rules={[{ required: true, message: '请输入球衣号码' }]}
        >
          <Input placeholder="请输入球衣号码" />
        </Form.Item>
        <Form.Item
          name="team"
          label="球队"
          rules={[{ required: true, message: '请输入球队名称' }]}
        >
          <Input placeholder="请输入球队名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlayerModal;