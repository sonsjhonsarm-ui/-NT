import React, { useState } from "react";
import { X, Sparkles, Calculator, BookOpen, RefreshCw, Check } from "lucide-react";
import { NTQuestion, SubjectType } from "../types";
import { playPopSound, playStarChime } from "../utils/audio";

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionGenerated: (newQ: NTQuestion) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onQuestionGenerated,
}) => {
  const [subject, setSubject] = useState<SubjectType>("math");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    playPopSound();

    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: topic || (subject === "math" ? "การบวกลบคูณหารระคนและเงินทอน" : "การอ่านจับใจความและข้อคิด"),
        }),
      });

      const data = await res.json();
      if (data && data.title) {
        playStarChime();
        onQuestionGenerated(data);
        onClose();
      } else {
        throw new Error("Invalid question generated");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถสร้างโจทย์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ");
    } finally {
      setIsGenerating(false);
    }
  };

  const mathTopics = [
    "การเปรียบเทียบเงินออมหลักหมื่น",
    "โจทย์ปัญหาเงินและเงินทอน",
    "เวลาและนาฬิกา (ชั่วโมง/นาที)",
    "เศษส่วนรูปภาพเค้กและพิซซ่า",
    "รูปเรขาคณิตและความยาวรอบรูป",
  ];

  const thaiTopics = [
    "อ่านนิทานสั้นจับใจความและข้อคิด",
    "ป้ายเตือนและสัญลักษณ์ความปลอดภัย",
    "สำนวนสุภาษิตไทย ป.3",
    "การอ่านบทร้อยกรองสอนใจ",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-amber-200 shadow-xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                สร้างโจทย์ข้อสอบ NT ใหม่ด้วย AI
              </h3>
              <p className="text-xs text-amber-100">
                ให้ Gemini ช่วยแต่งโจทย์ ป.3 ตามหัวข้อที่ต้องการ
              </p>
            </div>
          </div>
          <button
            id="btn-close-ai-generator"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4">
          {/* Subject selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">เลือกวิชา:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-gen-select-math"
                onClick={() => {
                  playPopSound();
                  setSubject("math");
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  subject === "math"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>🔢 คณิตศาสตร์</span>
              </button>

              <button
                type="button"
                id="btn-gen-select-thai"
                onClick={() => {
                  playPopSound();
                  setSubject("thai");
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  subject === "thai"
                    ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>📖 ภาษาไทย</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Topics */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">หัวข้อยอดนิยม (แตะเพื่อเลือก):</label>
            <div className="flex flex-wrap gap-1.5">
              {(subject === "math" ? mathTopics : thaiTopics).map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setTopic(t);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    topic === t
                      ? "bg-amber-500 text-white border-amber-600 font-bold"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">หรือระบุหัวข้อเอง:</label>
            <input
              id="input-custom-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="เช่น การคำนวณเงินซื้อของในตลาดสด..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="btn-start-generating-question"
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างโจทย์ข้อสอบ NT ป.3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างโจทย์ข้อสอบใหม่ทันที ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
