import React, { useRef, useEffect } from 'react';
import { Button, message } from 'antd';
import type { Match, Player, GameEvent } from '../types';
import { drawScoreSheetTemplate } from '../utils/scoreSheetTemplate';

interface Props {
  match: Match;
  players: Player[];
  events: GameEvent[];
}

const MatchScoreSheet: React.FC<Props> = ({ match, players, events }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('MatchScoreSheet 接收到的数据:', {
      match,
      players,
      events,
    });

    if (!canvasRef.current) {
      console.error('Canvas 元素未找到');
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('无法获取 Canvas 上下文');
      return;
    }

    // 设置画布大小为 A4 尺寸（以像素为单位，300dpi）
    canvas.width = 2480;  // A4 宽度 (8.27 inches * 300 dpi)
    canvas.height = 3508; // A4 高度 (11.69 inches * 300 dpi)

    console.log('Canvas 尺寸:', {
      width: canvas.width,
      height: canvas.height
    });

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制模板
    try {
      drawScoreSheetTemplate(ctx, canvas.width, canvas.height);
      console.log('模板绘制完成');
    } catch (error) {
      console.error('模板绘制失败:', error);
    }

    // 设置文字样式
    ctx.font = '32px SimSun';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // 填充基本信息
    const fillText = (text: string | undefined, x: number, y: number) => {
      if (text) {
        ctx.fillText(text, x, y);
      }
    };

    // 基本信息区域
    const headerY = 350;
    const boxStartY = headerY + 40;
    const lineSpacing = 60;

    // 填充甲乙队名称
    fillText(match.teamA, 220, headerY);
    fillText(match.teamB, canvas.width/2 + 120, headerY);

    // 第一行信息
    fillText(match.name, 250, boxStartY + lineSpacing * 0.75); // 比赛名称
    fillText(match.date, 810, boxStartY + lineSpacing * 0.75); // 日期
    fillText(match.time, 1410, boxStartY + lineSpacing * 0.75); // 时间
    fillText(match.mainReferee, 1710, boxStartY + lineSpacing * 0.75); // 主裁判

    // 第二行信息
    fillText(match.id, 250, boxStartY + lineSpacing * 2.25); // 比赛编号
    fillText(match.location, 810, boxStartY + lineSpacing * 2.25); // 地点
    fillText(match.assistantReferee, 1710, boxStartY + lineSpacing * 2.25); // 副裁判

    // 填充球员信息
    const fillPlayerTable = (teamPlayers: Player[], startY: number) => {
      teamPlayers.forEach((player, index) => {
        const y = startY + 110 + (index + 1) * 42; // 调整起始位置和行高
        ctx.textAlign = 'left';
        fillText(player.certificateNumber, 120, y); // 队员证号码
        fillText(player.name, 320, y); // 队员姓名
        fillText(player.number, 540, y); // 号码
        if (player.isStarter) {
          fillText('√', 680, y); // 上场队员标记
        }
      });
    };

    // 分别填充甲乙队球员信息
    const teamAPlayers = players.filter(p => p.team === 'A');
    const teamBPlayers = players.filter(p => p.team === 'B');
    fillPlayerTable(teamAPlayers, 900);  // 甲队球员表格
    fillPlayerTable(teamBPlayers, 1950); // 乙队球员表格

    // 填充教练信息
    fillText(match.coachA, 220, 1550); // 甲队教练
    fillText(match.assistantCoachA, 520, 1550); // 甲队助理教练
    fillText(match.coachB, 220, 2600); // 乙队教练
    fillText(match.assistantCoachB, 520, 2600); // 乙队助理教练

    // 填充得分记录
    let teamAScore = 0;
    let teamBScore = 0;
    const scoreStartY = 795; // 调整得分记录起始位置
    const cellWidth = 50;
    const cellHeight = 50;
    const colWidth = cellWidth * 4 + 40;

    events
      .filter(e => e.type === '得分' || e.type === '罚球')
      .forEach((event, index) => {
        if (index >= 160) return; // 最多显示160条记录

        const col = Math.floor(index / 40);
        const row = index % 40;
        const colX = canvas.width/2 + 100 + col * (colWidth + 40); // 调整列间距
        const rowY = scoreStartY + row * cellHeight;

        ctx.textAlign = 'center';
        if (event.team === 'A') {
          teamAScore += event.points || 0;
          fillText(teamAScore.toString(), colX + cellWidth, rowY + cellHeight/2);
        } else {
          teamBScore += event.points || 0;
          fillText(teamBScore.toString(), colX + cellWidth * 3, rowY + cellHeight/2);
        }
      });

    ctx.textAlign = 'left';

  }, [match, players, events]);

  const handleExport = () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${match.name}-记录表.png`;
      link.href = dataUrl;
      link.click();
      message.success('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Button type="primary" onClick={handleExport} style={{ marginBottom: '20px' }}>
        导出记录表
      </Button>
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            maxWidth: '1000px',
            border: '1px solid #ccc',
            backgroundColor: 'white'
          }}
        />
      </div>
    </div>
  );
};

export default MatchScoreSheet;