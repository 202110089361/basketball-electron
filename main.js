const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const expressApp = express();
const cors = require('cors');

// GPU 相关配置
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');

// 配置 ts-node
require('ts-node').register({
  project: path.join(__dirname, 'backend/tsconfig.json'),
  transpileOnly: true
});

// 启动 Express 服务器
expressApp.use(cors());
expressApp.use(express.json());

// 错误处理中间件
expressApp.use((err, req, res, next) => {
  console.error('Express 错误:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

// 请求日志中间件
expressApp.use((req, res, next) => {
  console.log('收到请求:', {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body
  });
  next();
});

// 添加路由
console.log('正在加载路由...');
const matchRoutes = require('./backend/src/routes/matchRoutes').default;
const playerRoutes = require('./backend/src/routes/playerRoutes').default;

expressApp.use('/matches', matchRoutes);
expressApp.use('/players', playerRoutes);

const server = expressApp.listen(3000, () => {
  console.log('Express server running on port 3000');
});

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // 始终打开开发者工具
  mainWindow.webContents.openDevTools();

  // 错误处理
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Window crashed! Event:', event);
  });

  mainWindow.on('unresponsive', () => {
    console.error('Window became unresponsive!');
  });

  // 监听页面加载完成事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成');
  });

  // 监听页面加载失败事件
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('页面加载失败:', {
      errorCode,
      errorDescription
    });
  });
}

// 当 Electron 完成初始化时创建窗口
app.whenReady().then(createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// 应用退出时关闭 Express 服务器
app.on('before-quit', () => {
  server.close();
});