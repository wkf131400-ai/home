import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini client (lazy initialized)
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Smart Home Scheme Chat endpoint
  app.post('/api/ai/plan-chat', async (req, res) => {
    try {
      const { message, history, project } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Return fallback flag if API key is not configured
        return res.json({
          success: true,
          isFallback: true,
          reply: generateLocalSmartReply(message, project),
        });
      }

      const systemInstruction = `你是一位专业的高级全屋智能家居方案架构师与室内智装设计师（智家AI架构师）。
用户的房屋信息：
- 小区/楼盘：${project?.communityName || '未命名小区'}
- 户型包含房间：${(project?.rooms || []).map((r: any) => r.name).join('、')}
- 预算范围：${project?.minBudget || 3}万 ~ ${project?.maxBudget || 10}万元

请根据用户的要求、生活习惯或调整意见，给出专业、亲切、条理清晰的智能家居方案定制建议与设备配置方案。
方案重点涵盖：
1. 智能灯光照明（多路开关、无主灯调光、磁吸轨道、色温调节、氛围灯带）
2. 智能遮阳窗帘（开合帘、卷帘、双层电机）
3. 传感与安防（人体存在感应器、智能门锁、水浸传感、门窗感应）
4. 环境与舒适（空调/新风/地暖智能温控面板、背景音乐）
5. 全屋联动场景（回家模式、离家模式、观影模式、起夜微光、睡眠模式）

请在回复中使用清晰排版、emoji与精炼语言，并在建议结尾提供明确的预算预估（万元）和设备数量建议。如果有针对特定房间的配置改动，请在回复中清晰列出。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n用户消息：${message}` }],
          },
        ],
      });

      const replyText = response.text || '已为您分析并更新全屋智能方案。';

      return res.json({
        success: true,
        reply: replyText,
        isFallback: false,
      });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      // Graceful fallback response
      const fallbackReply = generateLocalSmartReply(req.body?.message, req.body?.project);
      return res.json({
        success: true,
        reply: fallbackReply,
        isFallback: true,
      });
    }
  });

  // Helper function for local smart fallback
  function generateLocalSmartReply(message: string, project: any): string {
    const msg = (message || '').toLowerCase();
    const community = project?.communityName || '您的爱居';
    const minB = project?.minBudget || 5;
    const maxB = project?.maxBudget || 12;
    const rooms = project?.rooms || [];
    const roomNames = rooms.map((r: any) => r.name).join('、');

    if (msg.includes('经济') || msg.includes('性价比') || msg.includes('省钱') || msg.includes('预算低')) {
      return `### 💡 经济高性价比方案已为您规划完成

针对【${community}】（${roomNames}），我们已将配置优化至高性价比模式，预计预算约 **¥${(minB + (maxB - minB) * 0.25).toFixed(1)}万**：

1. **核心刚需设备保留**：
   - 客厅/主卧重点保留智能灯光调光与智能开合帘
   - 次卧及书房采用标准双路智能开关，兼顾便捷与成本
2. **传感配置精简**：
   - 仅在玄关与卫生间布置人体存在感应器，实现入户自动亮灯与起夜免触碰
   - 保留客厅多模智能网关中枢（1台）
3. **预算控制**：
   - 整体设备精简至约 18~24 件，完全处于您的期望预算下限区间！

您可以点击下方【下一步：确认产品清单】查看生成的具体设备报价。`;
    }

    if (msg.includes('灯光') || msg.includes('调光') || msg.includes('磁吸') || msg.includes('色温')) {
      return `### ✨ 全屋智能调光与高级光环境方案

已为【${community}】重点强化智能光影设计，预计预算约 **¥${((minB + maxB) / 2 + 1.2).toFixed(1)}万**：

1. **全屋无主灯全色温调光**：
   - 客厅升级为磁吸轨道射灯 + 线性洗墙灯带 + 防眩筒灯（支持2700K~6000K冷暖无级渐变）
   - 餐厅配备智能餐吊灯场景，支持「温馨用餐」、「浪漫微醺」光效
2. **主卧/书房健康节律照明**：
   - 模拟自然光线日落日出，睡前自动过渡为暖色微光助眠
   - 起夜微光联动地脚感应灯，起夜不刺眼
3. **控制方式**：
   - 搭配智能旋钮调光开关与语音双控

方案已同步至房间配置中，点击下方【下一步：确认产品清单】即可确认设备选型！`;
    }

    if (msg.includes('影音') || msg.includes('观影') || msg.includes('客厅')) {
      return `### 🎬 客厅全景影音与沉浸式观影方案

已为【${community}】配置影院级智能联动系统，预计预算约 **¥${((minB + maxB) / 2 + 0.8).toFixed(1)}万**：

1. **一键「影院模式」场景**：
   - 客厅双层电动窗帘（纱帘+遮光帘）自动静音闭合
   - 主灯缓缓熄灭，电视背景墙与沙发底悬浮氛围灯带微亮（15%亮度暖光）
   - 智能温控面板自动调节客厅温度至舒适的 24°C
2. **设备清单调整**：
   - 增加客厅双层开合帘电机套件
   - 增加大功率调光驱动与RGBW氛围灯带
   - 联动无线场景面板（4键自定义）

点击下方【下一步：确认产品清单】即可查看详细设备与价格！`;
    }

    if (msg.includes('安防') || msg.includes('门锁') || msg.includes('传感')) {
      return `### 🛡️ 全屋主动安防与传感守护方案

已为【${community}】强化安全防御体系，预计预算约 **¥${((minB + maxB) / 2 + 0.5).toFixed(1)}万**：

1. **入户安防**：
   - 玄关配置 3D人脸识别智能门锁（集成猫眼大屏+防撬报警+临时密码）
   - 门窗磁吸传感器（外出布防模式下异常开门立即手机推送与网关蜂鸣）
2. **环境与水电气防护**：
   - 厨房/卫生间配置智能水浸传感器，检测到漏水即刻联动电磁阀自动关水
   - 客厅/主卧/过道高精度人体存在感应器（毫米波微动检测）
3. **离家一键布防**：
   - 离家关门自动关闭全屋照明与窗帘，启动全屋安防监控

方案已就绪，点击下方【下一步：确认产品清单】即可查看！`;
    }

    // Default welcome & comprehensive generation
    return `### 🏡 智家AI架构师已为您生成全屋定制方案

根据【${community}】（${rooms.length}个房间：${roomNames}）及 **¥${minB}万~¥${maxB}万** 预算，为您量身定制如下全屋智能设备规划：

- **🛋️ 客厅与餐厅**：
  - 3路智能灯控 + 2路深防眩色温调光
  - 双层静音电动开合帘（100%全遮光）
  - 智能温控面板（空调/新风联动）
- **🛏️ 主卧与次卧**：
  - 双控智能开关 + 睡前一键全关场景
  - 单层静音电动窗帘
  - 毫米波人体存在传感器（起夜微光自动导引）
- **🍳 厨房、卫生间与阳台**：
  - 人感感应吸顶灯控（人来灯亮，人走延时灭）
  - 卫生间智能排风联动
- **🚪 玄关中枢**：
  - 3D人脸识别智能门锁 + 多模智能网关中枢

📊 **方案综合概算**：约 **¥${((minB + maxB) / 2).toFixed(1)}万**（约 26~32 件智能设备），完美落在预算舒适区！

您可以在对话框告诉我进一步想法（如“增加磁吸轨道灯”、“降低预算”、“强化安防”），或直接点击下方【下一步：确认产品清单】进入设备确认页！`;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
