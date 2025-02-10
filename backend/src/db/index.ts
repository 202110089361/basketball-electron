import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    console.log('检查数据目录:', DATA_DIR);
    await fs.access(DATA_DIR);
    console.log('数据目录已存在');
  } catch {
    console.log('数据目录不存在，正在创建...');
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('数据目录创建成功');
  }
}

// 读取数据
export async function readData(filePath: string) {
  try {
    console.log('正在读取文件:', filePath);
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf-8');
    console.log('文件读取成功，数据长度:', data.length);
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('文件不存在，返回空数组:', filePath);
      return [];
    }
    console.error('读取文件失败:', error);
    throw error;
  }
}

// 写入数据
export async function writeData(filePath: string, data: any) {
  try {
    console.log('正在写入文件:', filePath);
    await ensureDataDir();
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString);
    console.log('文件写入成功，数据长度:', jsonString.length);
  } catch (error) {
    console.error('写入文件失败:', error);
    throw error;
  }
}

export const db = {
  matches: {
    read: async () => {
      console.log('读取比赛数据');
      const data = await readData(MATCHES_FILE);
      console.log('比赛数据读取成功，数量:', data.length);
      return data;
    },
    write: async (data: any) => {
      console.log('写入比赛数据，数量:', data.length);
      await writeData(MATCHES_FILE, data);
      console.log('比赛数据写入成功');
    }
  },
  players: {
    read: async () => {
      console.log('读取球员数据');
      const data = await readData(PLAYERS_FILE);
      console.log('球员数据读取成功，数量:', data.length);
      return data;
    },
    write: async (data: any) => {
      console.log('写入球员数据，数量:', data.length);
      await writeData(PLAYERS_FILE, data);
      console.log('球员数据写入成功');
    }
  }
};