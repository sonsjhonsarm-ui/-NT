import React, { useState } from "react";
import { Volume2, VolumeX, CheckCircle2, HelpCircle, ChevronRight, Sparkles, BookOpen, Layers } from "lucide-react";
import { NTQuestion } from "../types";
import { speakThaiText, stopSpeaking, playPopSound } from "../utils/audio";

interface QuestionCardProps {
  question: NTQuestion;
  selectedChoiceIndex: number | null;
  onSelectChoice: (index: number) => void;
  onAskPtosHint: () => void;
  allQuestions: NTQuestion[];
  onSwitchQuestion: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedChoiceIndex,
  onSelectChoice,
  onAskPtosHint,
  allQuestions,
  onSwitchQuestion,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      let textToRead = `${question.title}. ${question.storyContext || ""} ${question.questionText}`;
      if (question.tableData && question.tableData.length > 0) {
        const tableText = question.tableData.map(item => `${item.label} ${item.value}`).join(", ");
        textToRead += `. ข้อมูลมีดังนี้: ${tableText}`;
      }
      speakThaiText(textToRead, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 md:p-6 relative overflow-hidden">
      {/* Background soft accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/40 via-orange-50/20 to-transparent pointer-events-none rounded-bl-full" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
            question.subject === "math"
              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
              : "bg-rose-100 text-rose-800 border border-rose-200"
          }`}>
            {question.subject === "math" ? "🔢 คณิตศาสตร์ ป.3" : "📖 ภาษาไทย ป.3"}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            สอบ NT ปี {question.year}
          </span>
          {question.page && (
            <span className="text-xs text-slate-400 font-medium">
              (หน้า {question.page})
            </span>
          )}
        </div>

        {/* Question Selector dropdown & Read Aloud button */}
        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            id="btn-read-question-aloud"
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isSpeaking
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-amber-100/80 hover:bg-amber-200/80 text-amber-900"
            }`}
            title="ให้พี่ทอสอ่านออกเสียงโจทย์ให้ฟัง"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? "กำลังอ่าน..." : "พี่ทอสอ่านให้ฟัง"}</span>
          </button>

          {/* Quick Question Switcher */}
          <div className="relative">
            <select
              id="select-nt-question"
              value={question.id}
              onChange={(e) => onSwitchQuestion(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-1.5 pr-6 font-medium cursor-pointer"
            >
              {allQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Question Title */}
      <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-relaxed">
        {question.title}
      </h2>

      {/* Topic Subtitle */}
      <p className="text-xs font-semibold text-amber-700 mb-4 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>หัวข้อทดสอบ: {question.topic}</span>
      </p>

      {/* Context / Story Passage */}
      {question.storyContext && (
        <div className="bg-amber-50/70 border-l-4 border-amber-400 p-3.5 rounded-r-xl mb-4 text-sm text-slate-700 leading-relaxed font-normal">
          {question.storyContext}
        </div>
      )}

      {/* Table Data (if any, like savings amounts) */}
      {question.tableData && question.tableData.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/30">
          <div className="bg-amber-100/70 px-4 py-2 text-xs font-bold text-amber-900 flex items-center justify-between">
            <span>📋 ตารางข้อมูลในโจทย์</span>
            <span className="text-[11px] text-amber-700 font-normal">สังเกตหลักหมื่นและหลักพัน</span>
          </div>
          <div className="divide-y divide-amber-100">
            {question.tableData.map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-amber-100/40 transition-colors"
              >
                <span className="font-semibold text-slate-800 text-sm">{item.label}</span>
                <span className="font-bold text-amber-900 bg-white px-3 py-1 rounded-lg border border-amber-200 text-sm shadow-2xs">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actual Question Prompt */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 mb-5">
        <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
          ❓ <span className="underline decoration-amber-400 underline-offset-4">{question.questionText}</span>
        </p>
      </div>

      {/* Multiple Choices (if choices provided) */}
      {question.choices && question.choices.length > 0 && (
        <div className="space-y-2.5 mb-5">
          <label className="text-xs font-bold text-slate-600 block">
            👇 เลือกคำตอบที่น้องคิดว่าถูกต้อง:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.choices.map((choice, idx) => {
              const isSelected = selectedChoiceIndex === idx;
              return (
                <button
                  key={idx}
                  id={`btn-choice-${idx}`}
                  onClick={() => {
                    playPopSound();
                    onSelectChoice(idx);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-white border-amber-600 font-bold shadow-sm ring-2 ring-amber-300"
                      : "bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <span>{choice}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Footer: Ask Hint */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>ติดตรงไหน? พี่ทอสพร้อมบอกใบ้ทีละสเต็ปให้ครับ</span>
        </div>
        <button
          id="btn-ask-ptos-hint"
          onClick={() => {
            playPopSound();
            onAskPtosHint();
          }}
          className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>ขอคำใบ้จากพี่ทอส 💡</span>
        </button>
      </div>
    </div>
  );
};
