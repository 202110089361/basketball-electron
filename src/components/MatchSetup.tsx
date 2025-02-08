import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Table, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { matchService } from '../services/matchService';
import './MatchSetup.css';

const MatchSetup: React.FC<{ matchId?: string }> = ({ matchId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const matchData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        status: 'ready'
      };

      if (matchId) {
        await matchService.updateMatchInfo(matchId, matchData);
        message.success('比赛信息更新成功');
      } else {
        await matchService.createMatch(matchData);
        message.success('比赛创建成功');
      }
    } catch (error) {
      message.error('操作失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const playerColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '号码', dataIndex: 'number', key: 'number' },
    { title: '位置', dataIndex: 'position', key: 'position' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="match-setup-form"
    >
      <div className="form-section">
        <h2>基本信息</h2>
        <Form.Item
          name="matchName"
          label="比赛名称"
          rules={[{ required: true, message: '请输入比赛名称' }]}
        >
          <Input placeholder="例如：2024春季联赛第一轮" />
        </Form.Item>

        <Form.Item
          name="matchType"
          label="比赛类型"
          rules={[{ required: true, message: '请选择比赛类型' }]}
        >
          <Select placeholder="请选择比赛类型">
            {['联赛', '杯赛', '友谊赛'].map(type => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="比赛日期"
          rules={[{ required: true, message: '请选择比赛日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="location"
          label="比赛地点"
          rules={[{ required: true, message: '请输入比赛地点' }]}
        >
          <Input placeholder="例如：市体育馆" />
        </Form.Item>
      </div>

      <div className="form-section">
        <h2>球队信息</h2>
        <Form.Item
          name="homeTeam"
          label="主队名称"
          rules={[{ required: true, message: '请输入主队名称' }]}
        >
          <Input placeholder="主队名称" />
        </Form.Item>

        <Form.List name="homeTeamPlayers">
          {(fields, { add, remove }) => (
            <>
              <Table
                dataSource={fields.map(field => form.getFieldValue(['homeTeamPlayers', field.name]))}
                columns={[
                  ...playerColumns,
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, __, index) => (
                      <MinusCircleOutlined onClick={() => remove(index)} />
                    ),
                  },
                ]}
                pagination={false}
              />
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加主队球员
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item
          name="awayTeam"
          label="客队名称"
          rules={[{ required: true, message: '请输入客队名称' }]}
        >
          <Input placeholder="客队名称" />
        </Form.Item>

        <Form.List name="awayTeamPlayers">
          {(fields, { add, remove }) => (
            <>
              <Table
                dataSource={fields.map(field => form.getFieldValue(['awayTeamPlayers', field.name]))}
                columns={[
                  ...playerColumns,
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, __, index) => (
                      <MinusCircleOutlined onClick={() => remove(index)} />
                    ),
                  },
                ]}
                pagination={false}
              />
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加客队球员
              </Button>
            </>
          )}
        </Form.List>
      </div>

      <div className="form-section">
        <h2>裁判信息</h2>
        <Form.List name="referees">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "请输入裁判姓名或删除此项",
                      },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="裁判姓名" />
                  </Form.Item>
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(index)}
                  />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加裁判
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {matchId ? '更新比赛信息' : '创建新比赛'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MatchSetup;