import express from 'express';
import cors from 'cors';
import matchRoutes from './routes/matchRoutes';
import playerRoutes from './routes/playerRoutes';

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/matches', matchRoutes);
app.use('/matches', playerRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});