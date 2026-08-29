import React, { useState, useRef, useEffect } from "react";
import { Send, Volume2, VolumeX, Sparkles, HelpCircle, User, Bot, Lightbulb, ChevronRight, MessageCircle } from "lucide-react";
import { ChatMessage, NTQuestion } from "../types";
import { speakThaiText, stopSpeaking, playHintChime, playPopSound } from "../utils/audio";

interface PTosTutorChatProps {
  question: NTQuestion;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isReplying: boolean;
  onSelectHintStep: (stepIndex: number) => void;
  currentHintStep: number;
}

export const PTosTutorChat: React.FC<PTosTutorChatProps> = ({
  question,
  messages,
  onSendMessage,
  isReplying,
  onSelectHintStep,
  currentHintStep,
}) => {
  const [inputText, setInputText] = useState("");
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isReplying) return;
    playPopSound();
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickAsk = (text: string) => {
    if (isReplying) return;
    playPopSound();
    onSendMessage(text);
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msgId);
      speakThaiText(text, () => setSpeakingMessageId(null));
    }
  };

  const quickQuestions = [
    "พี่ทอสช่วยใบ้ทีละนิดหน่อยครับ 💡",
    "ช่วยดูหลักหมื่นให้หน่อยครับ 🔍",
    "เปรียบเทียบยังไงต่อนะครับ 🤔",
    "ถ้าหนูตอบแบบนี้ถูกไหมครับ? ✨",
  ];

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm flex flex-col h-[520px] md:h-[600px] overflow-hidden">
      {/* Tutor Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🦁
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm md:text-base leading-tight">
                พี่ทอสติวเตอร์ใจดี
              </h3>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                พร้อมช่วยเสมอ
              </span>
            </div>
            <p className="text-[11px] text-amber-100 font-normal">
              ถามได้ตลอดเวลา • ไม่เฉลยทันที • ไกด์ทีละสเต็ป
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="text-right hidden sm:block">
          <span className="text-[11px] bg-black/15 px-2.5 py-1 rounded-lg text-amber-100 font-medium">
            💡 คำใบ้ขั้นที่ {currentHintStep + 1} / {question.guidingSteps.length || 3}
          </span>
        </div>
      </div>

      {/* Hint Ladder Quick Bar */}
      <div className="bg-amber-50/70 border-b border-amber-200/80 p-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-amber-900 shrink-0 flex items-center gap-1 ml-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>บันไดคำใบ้:</span>
        </span>
        {question.guidingSteps.map((_, idx) => (
          <button
            key={idx}
            id={`btn-hint-step-${idx}`}
            onClick={() => {
              playHintChime();
              onSelectHintStep(idx);
            }}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
              currentHintStep >= idx
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-white border border-amber-200 text-amber-900 hover:bg-amber-100"
            }`}
          >
            ขั้นที่ {idx + 1}
          </button>
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40">
        {messages.map((msg) => {
          const isPtos = msg.sender === "ptos";
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isPtos ? "justify-start" : "justify-end"}`}
            >
              {isPtos && (
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-2xs">
                  🦁
                </div>
              )}

              <div className={`max-w-[85%] space-y-1.5 ${isPtos ? "items-start" : "items-end"}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isPtos
                      ? "bg-white text-slate-800 border border-amber-200/90 rounded-tl-xs"
                      : "bg-amber-500 text-white font-medium rounded-tr-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* If this is P'Tos message, include TTS speaker button */}
                  {isPtos && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-normal">พี่ทอส</span>
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          isSpeaking
                            ? "bg-rose-500 text-white animate-pulse"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-800"
                        }`}
                        title="ฟังเสียงพี่ทอส"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? "กำลังอ่าน..." : "ฟังเสียง"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!isPtos && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  ป.3
                </div>
              )}
            </div>
          );
        })}

        {isReplying && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center text-sm shadow-2xs animate-bounce">
              🦁
            </div>
            <div className="bg-white border border-amber-200 px-4 py-2.5 rounded-2xl text-xs text-amber-800 font-medium flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              <span>พี่ทอสกำลังเรียบเรียงคำอธิบายง่ายๆ ให้น้อง...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Bar */}
      <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isReplying}
            onClick={() => handleQuickAsk(q)}
            className="text-[11px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-amber-100 flex items-center gap-2"
      >
        <input
          id="input-chat-message"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ถามพี่ทอสได้เลย เช่น 'ทำไมต้องดูหลักหมื่นก่อนครับ?'..."
          disabled={isReplying}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
        />
        <button
          id="btn-send-chat"
          type="submit"
          disabled={!inputText.trim() || isReplying}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
