import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { QuestionCard } from "./components/QuestionCard";
import { InteractiveBoard } from "./components/InteractiveBoard";
import { ThoughtInputPanel } from "./components/ThoughtInputPanel";
import { PTosTutorChat } from "./components/PTosTutorChat";
import { BadgesModal } from "./components/BadgesModal";
import { AIGeneratorModal } from "./components/AIGeneratorModal";
import { NT_QUESTIONS } from "./data/ntQuestions";
import { NTQuestion, SubjectType, StudentProfile, ThoughtEvaluation, ChatMessage } from "./types";
import { playStarChime, playHintChime, playPopSound } from "./utils/audio";

export default function App() {
  const [subject, setSubject] = useState<SubjectType>("math");
  const [questionsList, setQuestionsList] = useState<NTQuestion[]>(NT_QUESTIONS);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("math-2568-01");
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [thoughtText, setThoughtText] = useState<string>("");
  const [lastEvaluation, setLastEvaluation] = useState<ThoughtEvaluation | null>(null);
  const [currentHintStep, setCurrentHintStep] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);

  // Student Profile
  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("ptos_student_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: "น้องคนเก่ง",
      grade: "ป.3",
      totalStars: 10,
      badges: [
        {
          id: "b1",
          title: "🌟 นักคิดดาวรุ่ง",
          description: "เริ่มต้นฝึกคิดข้อสอบ NT กับพี่ทอส",
          icon: "🌟",
          date: new Date().toLocaleDateString("th-TH"),
        },
      ],
      completedQuestions: [],
    };
  });

  // Save student stats
  useEffect(() => {
    localStorage.setItem("ptos_student_profile", JSON.stringify(student));
  }, [student]);

  // Current Question
  const currentQuestion = questionsList.find((q) => q.id === currentQuestionId) || questionsList[0];

  // Chat messages with P'Tos
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-initial-1",
      sender: "ptos",
      text: `สวัสดีครับน้อง ๆ ป.3 ทุกคน! พี่ทอสติวเตอร์คนดีคนเดิมมาแล้วครับ! ✌️✨\n\nยินดีต้อนรับสู่ห้องเรียนเตรียมสอบ NT ปี 2568 นะครับ น้อง ๆ ไม่ต้องตื่นเต้นหรือกังวลไปนะ ข้อสอบพวกนี้เหมือนเกมปริศนาสนุก ๆ ที่เราจะมาช่วยกันแก้ครับ พี่ทอสจะอยู่ข้าง ๆ คอยบอกใบ้และให้กำลังใจน้อง ๆ เอง 🐻💛`,
      timestamp: Date.now(),
    },
    {
      id: "msg-initial-2",
      sender: "ptos",
      text: `เรามาเริ่มที่โจทย์ข้อนี้กันเลยครับ:\n💡 พี่ทอสแอบใบ้ให้ (Hint):\nเวลาเจอตัวเลขเยอะ ๆ หลักหมื่นแบบนี้ ให้น้อง ๆ ดูที่ "หลักหมื่น" (ตัวเลขหน้าสุด) ก่อนครับ\n• ใครมีหลักหมื่นเป็นเลข 5 บ้าง? (กลุ่มนี้เยอะสุด)\n• ใครมีหลักหมื่นเป็นเลข 4 ?\n• ใครมีหลักหมื่นเป็นเลข 3 ? (กลุ่มนี้น้อยสุด)\n\nลองพิมพ์วิธีคิดหรือลากเรียงลำดับดูนะครับ พี่ทอสรอให้คะแนนนักคิดดาวรุ่งอยู่นะ! 👏☀️`,
      timestamp: Date.now() + 100,
    },
  ]);

  const [isReplying, setIsReplying] = useState<boolean>(false);

  // Switch Question handler
  const handleSwitchQuestion = (qId: string) => {
    playPopSound();
    setCurrentQuestionId(qId);
    setSelectedChoiceIndex(null);
    setThoughtText("");
    setLastEvaluation(null);
    setCurrentHintStep(0);

    const q = questionsList.find((item) => item.id === qId);
    if (q) {
      setSubject(q.subject);
      // Append welcome guidance for this question
      const newGreeting: ChatMessage = {
        id: `msg-q-${Date.now()}`,
        sender: "ptos",
        text: `มาลุยโจทย์ใหม่กันครับ! 🚀\n"${q.title}"\n\n💡 คำใบ้แรกจากพี่ทอส: ${q.initialHint}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, newGreeting]);
    }
  };

  // Switch Subject
  const handleSelectSubject = (newSubject: SubjectType) => {
    setSubject(newSubject);
    const firstMatchingQ = questionsList.find((q) => q.subject === newSubject);
    if (firstMatchingQ) {
      handleSwitchQuestion(firstMatchingQ.id);
    }
  };

  // Add Thought text from interactive ranking or helper
  const handleApplyThoughtStep = (snippet: string) => {
    if (thoughtText.includes(snippet)) return;
    setThoughtText((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  // Send message in Chat
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: "student",
      text,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsReplying(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          question: currentQuestion,
          chatHistory: chatMessages.slice(-5),
        }),
      });

      const data = await res.json();
      const ptosMsg: ChatMessage = {
        id: `msg-p-${Date.now()}`,
        sender: "ptos",
        text: data.reply || "พี่ทอสชอบวิธีที่น้องคิดมากครับ! ลองสังเกตอีกนิดนะ 🌟",
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, ptosMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-p-${Date.now()}`,
        sender: "ptos",
        text: "สุดยอดมากครับน้องคนเก่ง! ลองสังเกตตัวเลขหลักหมื่นตามที่พี่ทอสไกด์ไว้นะครับ สู้ๆ! ✌️✨",
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsReplying(false);
    }
  };

  // Handle Hint Ladder step click
  const handleSelectHintStep = (stepIdx: number) => {
    setCurrentHintStep(stepIdx);
    const stepText = currentQuestion.guidingSteps[stepIdx] || currentQuestion.initialHint;

    const hintMsg: ChatMessage = {
      id: `hint-${Date.now()}`,
      sender: "ptos",
      text: `💡 บันไดคำใบ้ขั้นที่ ${stepIdx + 1}:\n${stepText}\n\nน้องๆ ลองนำขั้นตอนนี้ไปคิดต่อได้เลยครับ! 👏`,
      timestamp: Date.now(),
      isHint: true,
    };
    setChatMessages((prev) => [...prev, hintMsg]);
  };

  // Handle Thought Evaluation completion
  const handleEvaluationComplete = (evalResult: ThoughtEvaluation) => {
    setLastEvaluation(evalResult);

    // Award stars and badges
    const starsEarned = evalResult.effortScore || 10;
    setStudent((prev) => {
      const newTotalStars = prev.totalStars + starsEarned;
      const updatedBadges = [...prev.badges];

      if (evalResult.titleBadge && !updatedBadges.some((b) => b.title === evalResult.titleBadge)) {
        updatedBadges.push({
          id: `badge-${Date.now()}`,
          title: evalResult.titleBadge,
          description: `ได้จากการอธิบายวิธีคิดโจทย์: ${currentQuestion.title}`,
          icon: "🎖️",
          date: new Date().toLocaleDateString("th-TH"),
        });
      }

      return {
        ...prev,
        totalStars: newTotalStars,
        badges: updatedBadges,
        completedQuestions: Array.from(new Set([...prev.completedQuestions, currentQuestion.id])),
      };
    });

    // Add P'Tos feedback message into chat stream as well
    const feedbackChatMsg: ChatMessage = {
      id: `eval-msg-${Date.now()}`,
      sender: "ptos",
      text: `🎉 พี่ทอสตรวจวิธีคิดให้น้องแล้วครับ!\n\n🏆 ฉายาที่ได้รับ: ${evalResult.titleBadge}\n⭐ คะแนนวิธีคิด: ${evalResult.totalScore}/30 ดาว (ได้รับ +${starsEarned} ดาวสะสม!)\n\n👏 คำชม: ${evalResult.praiseText}\n💡 คำแนะนำ: ${evalResult.feedbackText}`,
      timestamp: Date.now(),
      evaluation: evalResult,
    };
    setChatMessages((prev) => [...prev, feedbackChatMsg]);
  };

  // New Question Generated by AI
  const handleQuestionGenerated = (newQ: NTQuestion) => {
    setQuestionsList((prev) => [newQ, ...prev]);
    handleSwitchQuestion(newQ.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-50/50 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentSubject={subject}
        onSelectSubject={handleSelectSubject}
        student={student}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6">
        
        {/* Banner with Greeting & Goal */}
        <div className="mb-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 md:p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  ห้องเรียนเตรียมสอบ NT ป.3
                </span>
                <span className="text-xs text-amber-100 font-medium hidden sm:inline">
                  • มีคะแนนวิธีคิดทุกข้อ
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                ติวข้อสอบ NT กับพี่ทอสติวเตอร์ใจดี ✨
              </h2>
              <p className="text-xs md:text-sm text-amber-100 max-w-2xl font-normal leading-relaxed">
                พี่ทอสจะไม่เฉลยคำตอบทันที แต่จะค่อย ๆ บอกใบ้และพาน้อง ๆ คิดทีละสเต็ป น้อง ๆ ลองเขียนหรือบอกวิธีคิดมา พี่ทอสมีคะแนนความพยายามและดาวรางวัลมอบให้ทุกครั้งครับ!
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                id="btn-banner-ai-gen"
                onClick={() => {
                  playPopSound();
                  setIsAIGeneratorOpen(true);
                }}
                className="bg-white text-amber-800 hover:bg-amber-50 font-bold text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <span>✨ สร้างโจทย์ AI ใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left (Question, Interactive Board, Thought Input) | Right (P'Tos Chat & Hint Ladder) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          
          {/* Left Column: 7 Cols */}
          <div className="lg:col-span-7 space-y-5 md:space-y-6">
            {/* 1. The NT Exam Question Card */}
            <QuestionCard
              question={currentQuestion}
              selectedChoiceIndex={selectedChoiceIndex}
              onSelectChoice={(idx) => setSelectedChoiceIndex(idx)}
              onAskPtosHint={() => handleSelectHintStep(currentHintStep < currentQuestion.guidingSteps.length - 1 ? currentHintStep + 1 : 0)}
              allQuestions={questionsList}
              onSwitchQuestion={handleSwitchQuestion}
            />

            {/* 2. Interactive Thinking Board (Ranking cards, Scratchpad Canvas, Place Values) */}
            <InteractiveBoard
              question={currentQuestion}
              onApplyThoughtStep={handleApplyThoughtStep}
            />

            {/* 3. Thought Process & Scoring Area (ฝึกคิด & ให้คะแนนวิธีคิด) */}
            <ThoughtInputPanel
              question={currentQuestion}
              thoughtText={thoughtText}
              onChangeThought={setThoughtText}
              selectedChoiceIndex={selectedChoiceIndex}
              onEvaluationComplete={handleEvaluationComplete}
              lastEvaluation={lastEvaluation}
            />
          </div>

          {/* Right Column: 5 Cols - P'Tos Chat & Live Guidance */}
          <div className="lg:col-span-5 space-y-5 md:space-y-6">
            <div className="sticky top-22">
              <PTosTutorChat
                question={currentQuestion}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isReplying={isReplying}
                onSelectHintStep={handleSelectHintStep}
                currentHintStep={currentHintStep}
              />
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-amber-200/80 bg-white/70 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🦁</span>
            <span className="font-semibold text-slate-700">พี่ทอสติวเตอร์ NT ป.3</span>
            <span className="text-slate-400">|</span>
            <span>เสริมสร้างวิธีคิดและความมั่นใจให้เด็กประถม 3</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            ขับเคลื่อนด้วย Gemini AI • รองรับข้อสอบคณิตศาสตร์และภาษาไทย
          </p>
        </div>
      </footer>

      {/* Modals */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        student={student}
      />

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onQuestionGenerated={handleQuestionGenerated}
      />
    </div>
  );
}
