import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment. Gemini features will use fallback smart responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-dev",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", tutor: "P'Tos NT Grade 3" });
});

// P'Tos Tutor Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, question, chatHistory } = req.body;
    const ai = getAI();

    const systemPrompt = `คุณคือ "พี่ทอส" ติวเตอร์ใจดี ร่าเริง อบอุ่น และใจเย็นมาก สำหรับน้อง ๆ ชั้นประถมศึกษาปีที่ 3 (อายุประมาณ 8-9 ขวบ) ที่กำลังเตรียมตัวสอบ NT (National Test)
หน้าที่หลักของคุณ:
1. อธิบายวิธีทำข้อสอบ NT ให้อ่านง่าย สนุก เข้าใจง่ายมากที่สุด เหมาะกับเด็ก ป.3
2. ให้กำลังใจตลอดเวลา เช่น "เก่งมากครับ", "ยอดเยี่ยมเลย", "ลองคิดตามพี่ทอสนะ", "ใกล้ถูกแล้วครับ!"
3. **ข้อห้ามสำคัญที่สุด**: ห้ามเฉลยคำตอบตรง ๆ ทันทีเด็ดขาด! หากน้องถามว่าตอบอะไร หรือข้อไหนถูก ให้ใช้วิธีบอกใบ้ (Hint) ไกด์ทีละสเต็ป ตั้งคำถามให้น้องฉุกคิดทีละขั้น
4. ใช้ภาษาพูดที่เป็นกันเอง ใส่อีโมจิน่ารักสดใส (🌟, ✌️, 💡, 👏, 🐻, 🎈) ไม่ใช้ศัพท์วิชาการยากเกินไป
5. ถ้าน้องตอบผิดหรือไม่แน่ใจ ให้ชมความพยายามก่อนเสมอ แล้วชี้จุดสังเกต เช่น "เกือบแล้วครับคนเก่ง ลองมองที่หลักพันอีกนิดนะ"
6. ข้อสอบปัจจุบัน:
หัวข้อ: ${question?.title || "ข้อสอบ NT ป.3"}
โจทย์: ${question?.questionText || ""}
ข้อมูลตาราง/ตัวเลือก: ${JSON.stringify(question?.tableData || question?.choices || "")}
คำใบ้ปัจจุบัน: ${question?.initialHint || ""}`;

    const prompt = `ประวัติการสนทนา:
${(chatHistory || []).map((m: any) => `${m.sender === "student" ? "น้อง ป.3" : "พี่ทอส"}: ${m.text}`).join("\n")}
น้อง ป.3 พูดว่า: "${message}"

จงตอบกลับน้องในฐานะพี่ทอสติวเตอร์ใจดี ไกด์วิธีคิดทีละนิด ให้กำลังใจ และทิ้งคำถามชวนคิดสั้นๆ 1 ข้อให้น้องลองทำต่อ`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "พี่ทอสพร้อมช่วยน้องเสมอครับ! ลองเล่าวิธีคิดให้น้องฟังหน่อยนะ 🌟";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.json({
      reply: "สวัสดีครับน้องคนเก่ง! พี่ทอสเห็นความตั้งใจของน้องแล้วนะ ลองดูตัวเลขหลักหน้าสุดก่อน แล้วบอกพี่ทอสว่าเห็นอะไรบ้างนะครับ ✌️✨",
    });
  }
});

// Thought Process & Effort Evaluation Endpoint
app.post("/api/evaluate-thought", async (req, res) => {
  try {
    const { thoughtText, question, studentAnswer, workSteps } = req.body;
    const ai = getAI();

    const prompt = `คุณคือ "พี่ทอส" ติวเตอร์ใจดีที่กำลังตรวจและให้คะแนน "วิธีคิด" ของน้อง ป.3 ในการทำข้อสอบ NT

โจทย์:
${question?.title || "ข้อสอบ NT"}
รายละเอียด: ${question?.questionText}
ข้อมูลประกอบ: ${JSON.stringify(question?.tableData || question?.choices || "")}

สิ่งที่น้องตอบ / วิธีคิดของน้อง:
- คำตอบของน้อง: "${studentAnswer || "ยังไม่ได้ระบุ"}"
- วิธีคิด / คำอธิบายของน้อง: "${thoughtText || ""}"
- ขั้นตอนที่น้องทด: "${workSteps || ""}"

หน้าที่ของคุณ:
1. ประเมินและให้คะแนน 3 ด้าน (คะแนนเต็มด้านละ 10 คะแนน):
   - effortScore (0-10): คะแนนความพยายามและความตั้งใจ (เด็กพิมพ์หรืออธิบายมา ให้คะแนนเต็มใจดี 8-10 เสมอ!)
   - logicScore (0-10): คะแนนตรรกะ ลำดับวิธีคิด และความสมเหตุสมผล
   - carefulnessScore (0-10): คะแนนความรอบคอบ การสังเกตข้อมูลในโจทย์
2. มอบฉายา / ตราสัญลักษณ์ (titleBadge) น่ารักๆ เช่น "🌟 ยอดนักคิดดาวรุ่ง", "🏆 จอมวางแผนตัวเลข", "💡 นักสังเกตตาเหยี่ยว", "👑 สุดยอดนักแก้โจทย์"
3. เขียนคำชม (praiseText) ที่อบอุ่น เจาะจงว่าน้องทำส่วนไหนได้ดีมาก
4. เขียนคำแนะนำเสริม (feedbackText) อธิบายแบบง่ายๆ สำหรับเด็ก ป.3 ชวนคิดต่อหรือชมเชยจุดเด่น
5. nextClue (คำใบ้ต่อไปหรือคำถามกระตุ้น): ไกด์ก้าวต่อไปให้ชัดเจน
6. isCompleted: เป็น boolean ว่าสรุปคำตอบถูกต้องครบถ้วนแล้วหรือไม่ (true ถ้าคำตอบและวิธีคิดถูกต้องครบ, false ถ้ายังมีจุดให้คิดต่อ)

ตอบกลับเป็น JSON ตามรูปแบบที่กำหนดเท่านั้น`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            effortScore: { type: Type.INTEGER, description: "คะแนนความพยายาม 0-10" },
            logicScore: { type: Type.INTEGER, description: "คะแนนตรรกะวิธีคิด 0-10" },
            carefulnessScore: { type: Type.INTEGER, description: "คะแนนความรอบคอบ 0-10" },
            totalScore: { type: Type.INTEGER, description: "ผลรวมคะแนน 0-30" },
            titleBadge: { type: Type.STRING, description: "ฉายานักคิด" },
            praiseText: { type: Type.STRING, description: "คำชมเชยจากพี่ทอส" },
            feedbackText: { type: Type.STRING, description: "คำแนะนำวิธีคิด" },
            nextClue: { type: Type.STRING, description: "คำใบ้หรือข้อชวนคิดขั้นต่อไป" },
            isCompleted: { type: Type.BOOLEAN, description: "ตอบถูกต้องครบถ้วนแล้วหรือไม่" },
          },
          required: ["effortScore", "logicScore", "carefulnessScore", "titleBadge", "praiseText", "feedbackText", "nextClue", "isCompleted"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const total = (parsed.effortScore || 10) + (parsed.logicScore || 9) + (parsed.carefulnessScore || 9);
    parsed.totalScore = total;

    res.json(parsed);
  } catch (error: any) {
    console.error("Evaluate API error:", error);
    // Kid-friendly fallback
    res.json({
      effortScore: 10,
      logicScore: 9,
      carefulnessScore: 9,
      totalScore: 28,
      titleBadge: "🌟 ยอดนักคิดดาวรุ่ง",
      praiseText: "สุดยอดมากครับน้องคนเก่ง! พี่ทอสประทับใจความตั้งใจในการเขียนวิธีคิดออกมามากๆ เลยครับ 👏✨",
      feedbackText: "วิธีคิดของน้องมีเหตุผลดีมาก น้องสังเกตจุดสำคัญได้ถูกต้องแล้วครับ",
      nextClue: "ลองทบทวนดูอีกนิดว่าคำถามถามถึงใครเป็นอันดับ 1 และอันดับ 4 นะครับ เก่งมากๆ เลย!",
      isCompleted: false,
    });
  }
});

// AI Generate NT Question Endpoint
app.post("/api/generate-question", async (req, res) => {
  try {
    const { subject, topic } = req.body;
    const ai = getAI();

    const prompt = `สร้างข้อสอบ NT สำหรับเด็กชั้น ป.3 (ปีการศึกษา 2568) ในวิชา: ${subject === "thai" ? "ความสามารถด้านภาษาไทย (การอ่านรู้เรื่อง / สื่อความ)" : "ความสามารถด้านคณิตศาสตร์"}
หัวข้อที่ต้องการ: ${topic || "ทั่วไปตามมาตรฐาน NT ป.3"}

ข้อสอบต้อง:
1. เหมาะกับระดับความรู้ ป.3 จริงๆ
2. มีบริบทสนุก เข้าใจง่าย เช่น ข้อมูลเงินออม, สวนสัตว์, งานวัด, ร้านขายของ, หรือนิทานสั้น
3. มีตัวเลือก 4 ช้อยส์ หรือตารางข้อมูล
4. มีคำใบ้เริ่มต้น (initialHint) สำหรับพี่ทอสใช้ไกด์
5. มีขั้นตอนนำทาง 3 ขั้น (guidingSteps)

ตอบกลับเป็น JSON รูปแบบนี้:
{
  "id": "gen-${Date.now()}",
  "year": "2568 (AI จำลอง)",
  "subject": "${subject || "math"}",
  "title": "ชื่อหัวข้อโจทย์สั้นๆ",
  "topic": "${topic || "คณิตศาสตร์/ภาษาไทย"}",
  "questionText": "เนื้อหาโจทย์คำถาม",
  "tableData": [{"label": "ชื่อ", "value": "ข้อมูล"}],
  "choices": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
  "correctAnswerIndex": 0,
  "initialHint": "คำใบ้เริ่มต้นแบบชวนคิด",
  "guidingSteps": ["ขั้นที่ 1...", "ขั้นที่ 2...", "ขั้นที่ 3..."],
  "defaultInteractiveType": "choice"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Generate question error:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// Serve frontend in production or hook Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`P'Tos NT Tutor server is running on port ${PORT}`);
  });
}

startServer();
