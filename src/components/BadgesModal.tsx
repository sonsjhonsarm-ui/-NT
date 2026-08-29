import React from "react";
import { X, Award, Star, Trophy, Sparkles, CheckCircle2 } from "lucide-react";
import { StudentProfile } from "../types";
import { playPopSound } from "../utils/audio";

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen) return null;

  const defaultBadges = [
    {
      id: "b1",
      title: "🌟 นักคิดดาวรุ่ง ป.3",
      description: "เริ่มต้นฝึกอธิบายวิธีคิดข้อสอบ NT กับพี่ทอส",
      icon: "🌟",
      unlocked: true,
    },
    {
      id: "b2",
      title: "🏆 จอมวางแผนหลักหมื่น",
      description: "สามารถเปรียบเทียบและเรียงลำดับจำนวนหลักหมื่นได้ถูกต้อง",
      icon: "🏆",
      unlocked: student.totalStars >= 10,
    },
    {
      id: "b3",
      title: "💡 นักสังเกตตาเหยี่ยว",
      description: "สังเกตจุดสำคัญในโจทย์และตารางข้อมูลได้อย่างรอบคอบ",
      icon: "💡",
      unlocked: student.totalStars >= 20,
    },
    {
      id: "b4",
      title: "👑 สุดยอดเซียน NT",
      description: "สะสมดาววิธีคิดครบ 30 ดาว",
      icon: "👑",
      unlocked: student.totalStars >= 30,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-amber-200 shadow-xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🎖️
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                คลังเหรียญรางวัล & ดาวสะสม
              </h3>
              <p className="text-xs text-amber-100">
                ผลงานการฝึกคิดของน้อง ป.3 คนเก่ง
              </p>
            </div>
          </div>
          <button
            id="btn-close-badges-modal"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Star Summary Card */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-500 fill-amber-400 animate-bounce" />
              <div>
                <div className="text-xs font-bold text-amber-800">ดาวสะสมทั้งหมด</div>
                <div className="text-2xl font-black text-amber-950">
                  {student.totalStars} <span className="text-sm font-normal">ดาว</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs bg-amber-200/80 text-amber-900 font-bold px-2.5 py-1 rounded-full">
                ระดับ: นักคิดไฟแรง 🔥
              </span>
            </div>
          </div>

          {/* Badges List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700">
              เหรียญเกียรติยศที่ปลดล็อก:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {defaultBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    badge.unlocked
                      ? "bg-white border-amber-300 shadow-xs"
                      : "bg-slate-50 border-slate-200 opacity-50 grayscale"
                  }`}
                >
                  <div className="text-2xl w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0">
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {badge.title}
                      </span>
                      {badge.unlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encouragement Footer */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
            🦁 <span className="font-bold text-amber-800">พี่ทอสบอกว่า:</span> "ทุกครั้งที่น้องอธิบายวิธีคิด น้องจะได้ทั้งดาวและความรู้เพิ่มขึ้นเสมอนะครับ!"
          </div>
        </div>
      </div>
    </div>
  );
};
