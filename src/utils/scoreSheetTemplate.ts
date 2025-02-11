export const drawScoreSheetTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // const margin = 20;
  // const usableWidth = width - (margin * 2);

  // 使用 usableWidth 进行计算，删除未使用的变量

  // 使用 totalWidth 进行计算
  // const columnWidth = usableWidth / 4;
  // const maxWidth = width - margin * 2;

  // 设置基本样式
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // 绘制外边框
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // 绘制标题和logo
  // TODO: 添加logo图片
  ctx.font = 'bold 80px SimSun';
  ctx.textAlign = 'center';
  ctx.fillText('篮球比赛记录表', width / 2, 150);
  ctx.fillText('(4x      分钟)', width / 2, 230);

  // 恢复默认对齐方式
  ctx.textAlign = 'left';
  ctx.font = '24px SimSun';

  // 绘制基本信息区域
  const headerY = 350; // 向下移动100个单位
  const lineSpacing = 60; // 进一步增大行间距

  // 绘制甲乙队标题
  ctx.font = '38px SimSun'; // 进一步增大字体
  ctx.fillText('甲队：', 100, headerY);
  ctx.fillText('乙队：', width/2, headerY);

  // 绘制基本信息表格
  const boxStartY = headerY + 40; // 进一步增大间距
  const boxHeight = lineSpacing * 3; // 进一步增大表格高度

  // 绘制外框
  ctx.strokeRect(100, boxStartY, width - 200, boxHeight);

  // 绘制竖线分隔
  const colWidths = [600, 600, 300, 300]; // 每列宽度
  let currentX = 100;
  for (let i = 1; i < 4; i++) {
    currentX += colWidths[i-1];
    ctx.beginPath();
    ctx.moveTo(currentX, boxStartY);
    ctx.lineTo(currentX, boxStartY + boxHeight);
    ctx.stroke();
  }

  // 绘制横线分隔
  ctx.beginPath();
  ctx.moveTo(100, boxStartY + lineSpacing * 1.5);
  ctx.lineTo(width - 100, boxStartY + lineSpacing * 1.5);
  ctx.stroke();

  // 第一行内容
  ctx.font = '32px SimSun'; // 进一步增大内容字体
  ctx.fillText('比赛名称：', 110, boxStartY + lineSpacing * 0.75);
  ctx.fillText('日期：', 710, boxStartY + lineSpacing * 0.75);
  ctx.fillText('时间：', 1310, boxStartY + lineSpacing * 0.75);
  ctx.fillText('主裁判：', 1610, boxStartY + lineSpacing * 0.75);

  // 第二行内容
  ctx.fillText('比赛编号：', 110, boxStartY + lineSpacing * 2.25);
  ctx.fillText('地点：', 710, boxStartY + lineSpacing * 2.25);
  ctx.fillText('副裁判：', 1610, boxStartY + lineSpacing * 2.25);

  // 绘制暂停和犯规区域
  const drawTeamSection = (y: number) => {
    const startX = 100;
    const boxSize = 40; // 再次增大格子大小
    const boxSpacing = 40; // 再次增大格子间距

    // 绘制暂停格子和标签
    const pauseStartX = startX;
    const pauseStartY = y + 35; // 给"暂停"文字留出更多空间

    // 暂停文字
    ctx.font = '36px SimSun'; // 再次增大暂停文字
    ctx.fillText('暂停', pauseStartX, y);

    // 绘制标签文字
    ctx.font = '28px SimSun'; // 再次增大标签文字

    // 上半节（2个格子）
    for(let i = 0; i < 2; i++) {
      ctx.strokeRect(
        pauseStartX + i * boxSpacing,
        pauseStartY,
        boxSize,
        boxSize
      );
    }
    ctx.fillText('上半节', pauseStartX + boxSpacing * 2 + 12, pauseStartY + boxSize/2);

    // 下半节（3个格子）
    for(let i = 0; i < 3; i++) {
      ctx.strokeRect(
        pauseStartX + i * boxSpacing,
        pauseStartY + boxSpacing,
        boxSize,
        boxSize
      );
    }
    ctx.fillText('下半节', pauseStartX + boxSpacing * 3 + 12, pauseStartY + boxSpacing + boxSize/2);

    // 决胜期（3个格子）
    for(let i = 0; i < 3; i++) {
      ctx.strokeRect(
        pauseStartX + i * boxSpacing,
        pauseStartY + boxSpacing * 2,
        boxSize,
        boxSize
      );
    }
    ctx.fillText('决胜期', pauseStartX + boxSpacing * 3 + 12, pauseStartY + boxSpacing * 2 + boxSize/2);

    ctx.font = '36px SimSun'; // 恢复更大的字体大小

    // 全队犯规区域（在暂停区域右侧）
    const foulStartX = startX + 350; // 再次增大间距
    ctx.fillText('全队犯规', foulStartX - 70, y);

    // 绘制犯规记录格子（2行，每行8个格子分为两组）
    const drawFoulRow = (rowY: number, labels: string[]) => {
      labels.forEach((label, index) => {
        const groupX = foulStartX + (index * 220); // 再次增大组间距
        ctx.fillText(label, groupX - 50, rowY + 50);
        // 每组4个格子，更宽松的布局
        for (let i = 0; i < 4; i++) {
          ctx.strokeRect(groupX + i * boxSpacing, rowY + 25, boxSize, boxSize);
          // 数字放在格子内部
          ctx.font = '26px SimSun'; // 再次增大数字字体
          ctx.fillText((i + 1).toString(), groupX + 16 + i * boxSpacing, rowY + 55);
          ctx.font = '36px SimSun';
        }
      });
    };

    // 绘制上半节和下半节的犯规记录
    drawFoulRow(y + 25, ['①', '②']);
    drawFoulRow(y + 70, ['③', '④']); // 再次增大行间距
  };

  // 绘制球员信息表格
  const drawPlayerTable = (y: number) => {
    const startX = 100;
    const tableWidth = 1200; // 保持总宽度不变
    const colWidths = [220, 220, 120, 280, 360]; // 调整各列宽度：减少证号码和姓名列宽度，增加上场队员列宽度

    // 表头 - 增加垂直高度
    const headerHeight = 100; // 保持表头高度不变
    ctx.font = '36px SimSun'; // 保持字体大小不变
    ctx.fillText('队员证号码', startX + 20, y + 60); // 调整文字位置
    ctx.fillText('队员姓名', startX + colWidths[0] + 20, y + 60);
    ctx.fillText('号码', startX + colWidths[0] + colWidths[1] + 20, y + 60);
    ctx.fillText('上场队员', startX + colWidths[0] + colWidths[1] + colWidths[2] + 60, y + 60); // 调整文字位置，使其居中

    // 个人犯规标题和数字
    const foulStartX = startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];

    // 绘制"个人犯规"标题框
    ctx.strokeRect(foulStartX, y + 10, colWidths[4], headerHeight/2);
    ctx.fillText('个人犯规', foulStartX + 110, y + 35);

    // 绘制数字1-6的格子
    const numberWidth = colWidths[4] / 6;
    for (let i = 0; i < 6; i++) {
      // 绘制每个数字的格子
      ctx.strokeRect(
        foulStartX + i * numberWidth,
        y + 10 + headerHeight/2,
        numberWidth,
        headerHeight/2
      );
      // 在格子中填入数字,最后一个格子不填数字
      if (i < 5) {
        ctx.fillText(
          (i + 1).toString(),
          foulStartX + i * numberWidth + numberWidth/2 - 10,
          y + 10 + headerHeight * 0.75
        );
      }
    }

    // 绘制表格外框
    ctx.beginPath();
    ctx.rect(startX, y + 10, tableWidth, 600); // 增加表格高度

    // 绘制竖线
    let currentX = startX;
    // 先绘制最左边的竖线（从表格顶部到底部）
    ctx.moveTo(startX, y + 10);
    ctx.lineTo(startX, y + 610);

    // 绘制其他竖线
    for (let i = 0; i < colWidths.length; i++) {
      currentX += colWidths[i];
      ctx.moveTo(currentX, y + 10);
      ctx.lineTo(currentX, y + 610);
    }

    // 绘制横线
    const rowHeight = 42; // 增加行高
    const rowCount = 12; // 12行

    // 先绘制表头分隔线
    ctx.moveTo(startX, y + 10 + headerHeight);
    ctx.lineTo(startX + tableWidth, y + 10 + headerHeight);

    // 绘制内容区域的横线，所有行都绘制完整横线
    for (let i = 1; i <= rowCount; i++) {
      ctx.moveTo(startX, y + 10 + headerHeight + i * rowHeight);
      ctx.lineTo(startX + tableWidth, y + 10 + headerHeight + i * rowHeight);
    }

    // 在个人犯规区域绘制竖线
    const personalFoulStartX = startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
    const personalFoulWidth = colWidths[4] / 6;
    for (let i = 1; i < 6; i++) {
      ctx.moveTo(personalFoulStartX + i * personalFoulWidth, y + 10 + headerHeight);
      ctx.lineTo(personalFoulStartX + i * personalFoulWidth, y + 610);
    }

    ctx.stroke();
  };

  // 绘制教练区域
  const drawCoachSection = (y: number) => {
    ctx.font = '25px SimSun';
    ctx.fillText('教练员：', 100, y);
    ctx.fillText('助理教练员：', 400, y);
  };

  // 绘制得分记录区域
  const drawScoreGrid = (y: number) => {
    const startX = width/2 + 100;  // 从页面中间往右偏移开始绘制
    const cellWidth = 50;  // 增加单元格宽度
    const cellHeight = 50; // 增加单元格高度
    const colCount = 4;    // 4列
    const rowCount = 40;   // 每列40行

    // 绘制标题
    ctx.font = '36px SimSun'; // 增大标题字号
    ctx.textAlign = 'center';
    ctx.fillText('累积分', startX + 350, y - 60); // 调整标题位置
    ctx.textAlign = 'left';

    // 计算每列的总宽度
    const colWidth = cellWidth * 4; // 每列4个格子的总宽度
    // const totalWidth = (colWidth + 40) * colCount; // 总宽度，适当增加列间距

    // 绘制表格
    for (let col = 0; col < colCount; col++) {
      const colX = startX + col * (colWidth + 40); // 适当增加列间距

      // 绘制A/B标题
      ctx.beginPath();
      ctx.strokeRect(colX, y - 5, colWidth, 45); // 增加标题高度

      // 绘制标题中的分隔线
      ctx.moveTo(colX + cellWidth * 2, y - 5);
      ctx.lineTo(colX + cellWidth * 2, y + 40);
      ctx.stroke();

      // 填写A/B标题
      ctx.font = '30px SimSun'; // 增大A/B标题字号
      ctx.textAlign = 'center';
      ctx.fillText('A', colX + cellWidth, y + 20);
      ctx.fillText('B', colX + cellWidth * 3, y + 20);
      ctx.textAlign = 'left';

      for (let row = 0; row < rowCount; row++) {
        const rowY = y + 45 + row * cellHeight;
        const num = row + 1 + col * rowCount;

        // 绘制四个格子
        for (let i = 0; i < 4; i++) {
          ctx.strokeRect(colX + i * cellWidth, rowY, cellWidth, cellHeight);
        }

        // 在中间两个格子填入序号
        ctx.font = '24px SimSun'; // 增大序号字号
        ctx.textAlign = 'center';
        ctx.fillText(num.toString(), colX + cellWidth * 1.5, rowY + cellHeight/2 + 4);
        ctx.fillText(num.toString(), colX + cellWidth * 2.5, rowY + cellHeight/2 + 4);
        ctx.textAlign = 'left';
      }
    }

    ctx.font = '24px SimSun'; // 恢复默认字体
  };

  // 绘制底部信息
  const drawBottomSection = (y: number) => {
    // 比分记录
    ctx.font = '38px SimSun';
    ctx.fillText('比分：', 150, y-100);
    ctx.fillText('上半场① 甲＿＿乙＿＿② 甲＿＿乙＿＿', 270, y-100);
    ctx.fillText('下半场① 甲＿＿乙＿＿② 甲＿＿乙＿＿', 270, y-10);
    ctx.fillText('决胜期  甲＿＿乙＿＿', 270, y + 80);

    // 最后比分和优胜队
    ctx.fillText('最后比分：', width/2+100, y-100);
    ctx.fillText('甲队＿＿＿＿＿', width/2 + 300, y-100);
    ctx.fillText('乙队＿＿＿＿＿', width/2 + 650, y-100);
    ctx.fillText('优胜队：＿＿＿＿＿＿＿', width/2+100, y + 40);

    // 记录员信息
    ctx.fillText('记录员：＿＿＿＿＿＿＿', 150, y + 200);
    ctx.fillText('计时员：＿＿＿＿＿＿＿', 150, y + 280);
    ctx.fillText('24"计时员：＿＿＿＿＿＿＿', 150, y + 360);

    // 裁判签名
    ctx.fillText('主裁判：＿＿＿＿＿＿＿', width - 710, y + 200);
    ctx.fillText('副裁判：＿＿＿＿＿＿＿', width - 700, y + 280);
    ctx.fillText('球队抗议队长签名：＿＿＿＿＿＿＿', width - 710, y + 360);
  };

  // 绘制各个区域
  // 左侧区域
  drawTeamSection(700);  // 甲队区域
  drawPlayerTable(900);  // 甲队球员表格
  drawCoachSection(1550);  // 甲队教练区域

  drawTeamSection(1750);  // 乙队区域
  drawPlayerTable(1950);  // 乙队球员表格
  drawCoachSection(2600);  // 乙队教练区域

  // 右侧区域
  drawScoreGrid(750);  // 得分记录区域移到右侧，与甲队区域同一起始高度

  drawBottomSection(height - 500);  // 底部信息
};