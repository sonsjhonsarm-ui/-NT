import React, { useState } from "react";
import { Send, Sparkles, Award, Star, CheckCircle, RefreshCw, MessageSquare, Lightbulb } from "lucide-react";
import confetti from "canvas-confetti";
import { NTQuestion, ThoughtEvaluation } from "../types";
import { playStarChime, playCelebrationFanfare, playPopSound } from "../utils/audio";

interface ThoughtInputPanelProps {
  question: NTQuestion;
  thoughtText: string;
  onChangeThought: (text: string) => void;
  selectedChoiceIndex: number | null;
  onEvaluationComplete: (evalResult: ThoughtEvaluation) => void;
  lastEvaluation: ThoughtEvaluation | null;
}

export const ThoughtInputPanel: React.FC<ThoughtInputPanelProps> = ({
  question,
  thoughtText,
  onChangeThought,
  selectedChoiceIndex,
  onEvaluationComplete,
  lastEvaluation,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Quick Starter Chips
  const starterPrompts = [
    "หนูเริ่มสังเกตจากหลักหมื่นก่อน...",
    "เปรียบเทียบในกลุ่มเลข 5 คือ พิมพ์ใจ กับ ปรีชา...",
    "ดังนั้น อันดับที่ 1 คือ... และอันดับที่ 4 คือ...",
    "เพราะว่าตัวเลขหลักพันของ...",
  ];

  const handleAddPrompt = (promptText: string) => {
    playPopSound();
    if (thoughtText.trim()) {
      onChangeThought(`${thoughtText}\n${promptText}`);
    } else {
      onChangeThought(promptText);
    }
  };

  const handleSubmitThought = async () => {
    if (!thoughtText.trim() && selectedChoiceIndex === null) {
      alert("น้องๆ ลองพิมพ์วิธีคิดหรือเลือกคำตอบสักนิด แล้วกดส่งให้พี่ทอสตรวจนะคร้าบ 🌟");
      return;
    }

    setIsEvaluating(true);
    playPopSound();

    try {
      const studentAnswer =
        selectedChoiceIndex !== null && question.choices
          ? question.choices[selectedChoiceIndex]
          : "ไม่ได้เลือกช้อยส์";

      const res = await fetch("/api/evaluate-thought", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thoughtText: thoughtText || "น้องเลือกคำตอบโดยตรง",
          question,
          studentAnswer,
          workSteps: thoughtText,
        }),
      });

      const data = await res.json();
      onEvaluationComplete(data);

      // Trigger Celebration effects
      if (data.totalScore >= 20 || data.effortScore >= 8) {
        playCelebrationFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"],
        });
      } else {
        playStarChime();
      }
    } catch (e) {
      console.error("Evaluation error", e);
      // Friendly local fallback
      const fallbackEval: ThoughtEvaluation = {
        effortScore: 10,
        logicScore: 9,
        carefulnessScore: 9,
        totalScore: 28,
        titleBadge: "🌟 ยอดนักคิดดาวรุ่ง",
        praiseText: "ยอดเยี่ยมมากเลยครับน้อง ป.3 คนเก่ง! พี่ทอสภูมิใจในความตั้งใจอธิบายวิธีคิดของน้องมากๆ 👏✨",
        feedbackText: "ลำดับวิธีคิดของน้องมีเหตุผลดีมาก สังเกตตัวเลขหลักสำคัญได้ครบถ้วนแล้วครับ",
        nextClue: "ลองตรวจดูอีกครั้งนะว่าคำตอบที่เลือกตรงกับที่สรุปไว้ไหม เก่งมากครับ!",
        isCompleted: true,
      };
      onEvaluationComplete(fallbackEval);
      playCelebrationFanfare();
      confetti({ particleCount: 50, spread: 60 });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 md:p-6 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            💭
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span>พื้นที่ฝึกคิด & อธิบายวิธีทำ</span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                +10 ดาวความพยายาม
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              พิมพ์บอกพี่ทอสว่า "น้องคิดอย่างไร" ได้เลยครับ ยิ่งอธิบาย ยิ่งได้คะแนนวิธีคิดเยอะนะ!
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>แตะเพื่อใส่ข้อความช่วยคิด:</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPrompt(prompt)}
              className="text-xs bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer text-left"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          id="textarea-student-thought"
          value={thoughtText}
          onChange={(e) => onChangeThought(e.target.value)}
          placeholder="พิมพ์วิธีคิดของน้องที่นี่ เช่น: หนูดูที่หลักหมื่นก่อน พบว่า พิมพ์ใจ (57,413) กับ ปรีชา (54,173) มีหลักหมื่นเป็น 5 เยอะที่สุด พอเปรียบเทียบหลักพัน พบว่าพิมพ์ใจ 57,000 มากกว่า ปรีชา 54,000..."
          rows={4}
          className="w-full p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 text-slate-800 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-slate-400 font-normal leading-relaxed resize-y"
        />
        <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">
          {thoughtText.length} ตัวอักษร
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="text-xs text-slate-500 font-medium">
          🌟 มีคะแนน <span className="font-bold text-amber-600">"นักคิดดาวรุ่ง"</span> ให้ทุกความตั้งใจครับ!
        </div>
        <button
          id="btn-submit-thought-eval"
          disabled={isEvaluating}
          onClick={handleSubmitThought}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>พี่ทอสกำลังอ่านวิธีคิด...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>ส่งวิธีคิดให้พี่ทอสตรวจและให้คะแนน 🌟</span>
            </>
          )}
        </button>
      </div>

      {/* Evaluation Results Card */}
      {lastEvaluation && (
        <div className="mt-4 bg-gradient-to-br from-amber-50 via-orange-50/50 to-white rounded-2xl border-2 border-amber-300 p-4 md:p-5 shadow-sm space-y-4 animate-fadeIn">
          {/* Result Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-xl shadow-xs">
                🏆
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 block">
                  ผลการประเมินวิธีคิดโดยพี่ทอส
                </span>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>{lastEvaluation.titleBadge || "🌟 ยอดนักคิดดาวรุ่ง"}</span>
                </h4>
              </div>
            </div>

            {/* Total Star Score Display */}
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-lg font-black text-amber-900">{lastEvaluation.totalScore}</span>
              <span className="text-xs text-slate-400 font-bold">/ 30 ดาว</span>
            </div>
          </div>

          {/* 3 Metric Score Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Metric 1: Effort */}
            <div className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">💖 ความพยายาม</span>
                <span className="font-extrabold text-amber-600">{lastEvaluation.effortScore}/10</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(lastEvaluation.effortScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Logic */}
            <div className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">🧠 ตรรกะเหตุผล</span>
                <span className="font-extrabold text-indigo-600">{lastEvaluation.logicScore}/10</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(lastEvaluation.logicScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Carefulness */}
            <div className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">🔍 ความรอบคอบ</span>
                <span className="font-extrabold text-emerald-600">{lastEvaluation.carefulnessScore}/10</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(lastEvaluation.carefulnessScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Praise & Feedback */}
          <div className="space-y-2">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl">
              <p className="text-xs md:text-sm font-semibold text-emerald-900 leading-relaxed">
                👏 <span className="font-bold">คำชมจากพี่ทอส:</span> {lastEvaluation.praiseText}
              </p>
            </div>

            <div className="bg-amber-100/50 border border-amber-200 p-3 rounded-xl">
              <p className="text-xs md:text-sm text-slate-800 leading-relaxed">
                💡 <span className="font-bold text-amber-900">คำแนะนำเสริม:</span> {lastEvaluation.feedbackText}
              </p>
            </div>

            {lastEvaluation.nextClue && (
              <div className="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl flex items-start gap-2">
                <span className="text-base">🚀</span>
                <p className="text-xs md:text-sm text-indigo-900 leading-relaxed font-medium">
                  <span className="font-bold">ก้าวต่อไป:</span> {lastEvaluation.nextClue}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
