import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import MatchList from './pages/MatchList';
import MatchPlayers from './pages/MatchPlayers';
import GameRecorder from './pages/GameRecorder';
import './App.css';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link to="/">比赛列表</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '24px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<MatchList />} />
            <Route path="/match/:matchId/players" element={<MatchPlayers />} />
            <Route path="/match/:matchId/record" element={<GameRecorder />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
