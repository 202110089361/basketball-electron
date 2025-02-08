const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const expressApp = express();
const cors = require('cors');

// 启动 Express 服务器
expressApp.use(cors());
expressApp.use(express.json());

// TODO: 后续添加路由
// expressApp.use('/api/matches', require('./backend/src/routes/matchRoutes'));
// expressApp.use('/api/players', require('./backend/src/routes/playerRoutes'));

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
      contextIsolation: false
    }
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
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

// 应用退出时关闭 Express 服务器
app.on('before-quit', () => {
  server.close();
});