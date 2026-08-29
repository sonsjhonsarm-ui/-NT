import React from "react";
import { Star, Award, Sparkles, Volume2, VolumeX, BookOpen, Calculator, PlusCircle } from "lucide-react";
import { SubjectType, StudentProfile } from "../types";
import { playPopSound } from "../utils/audio";

interface NavbarProps {
  currentSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  student: StudentProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenBadges: () => void;
  onOpenAIGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSubject,
  onSelectSubject,
  student,
  soundEnabled,
  onToggleSound,
  onOpenBadges,
  onOpenAIGenerator,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Character Banner */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-white">
                🦁
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                ป.3
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  พี่ทอสติวเตอร์ NT
                  <span className="inline-flex items-center text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    ปี 2568
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                ติวเตอร์ใจดี ไกด์วิธีคิด ไม่เฉลยทันที พร้อมให้คะแนนวิธีคิด
              </p>
            </div>
          </div>

          {/* Subject Switcher Tabs */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-switch-math"
              onClick={() => {
                playPopSound();
                onSelectSubject("math");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentSubject === "math"
                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>คณิตศาสตร์</span>
            </button>
            <button
              id="btn-switch-thai"
              onClick={() => {
                playPopSound();
                onSelectSubject("thai");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentSubject === "thai"
                  ? "bg-white text-rose-600 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>ภาษาไทย</span>
            </button>
          </div>

          {/* Right Action Bar: Stars, Badges, AI Generator, Sound */}
          <div className="flex items-center gap-2">
            
            {/* Generate Custom NT Question button */}
            <button
              id="btn-open-ai-generator"
              onClick={() => {
                playPopSound();
                onOpenAIGenerator();
              }}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างโจทย์ AI</span>
            </button>

            {/* Stars Bank Counter */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300/80 px-3 py-1.5 rounded-xl shadow-2xs">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
              <span className="text-sm font-bold text-amber-900">{student.totalStars}</span>
              <span className="text-xs text-amber-700 font-medium hidden sm:inline">ดาว</span>
            </div>

            {/* Badges / Awards Button */}
            <button
              id="btn-open-badges"
              onClick={() => {
                playPopSound();
                onOpenBadges();
              }}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="ดูเหรียญรางวัลและฉายา"
            >
              <Award className="w-5 h-5 text-amber-600" />
              {student.badges.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {student.badges.length}
                </span>
              )}
            </button>

            {/* Sound Toggle Button */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={soundEnabled ? "ปิดเสียงประกอบ" : "เปิดเสียงประกอบ"}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
