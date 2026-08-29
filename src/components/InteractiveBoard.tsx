import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, RotateCcw, PenTool, Eraser, Trash2, Check, Sparkles, Layers, Palette } from "lucide-react";
import { NTQuestion, NTTableItem } from "../types";
import { playPopSound } from "../utils/audio";

interface InteractiveBoardProps {
  question: NTQuestion;
  onApplyThoughtStep: (text: string) => void;
}

export const InteractiveBoard: React.FC<InteractiveBoardProps> = ({
  question,
  onApplyThoughtStep,
}) => {
  const [activeTab, setActiveTab] = useState<"ranking" | "scratchpad" | "placevalue">("ranking");

  // Ranking state
  const [rankingList, setRankingList] = useState<NTTableItem[]>([]);

  useEffect(() => {
    if (question.tableData && question.tableData.length > 0) {
      setRankingList([...question.tableData]);
    } else {
      setRankingList([]);
    }
  }, [question]);

  const moveItem = (index: number, direction: "up" | "down") => {
    playPopSound();
    const newList = [...rankingList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setRankingList(newList);
  };

  const resetRanking = () => {
    playPopSound();
    if (question.tableData) {
      setRankingList([...question.tableData]);
    }
  };

  const applyCurrentRankingToThought = () => {
    playPopSound();
    if (rankingList.length === 0) return;
    const rankingSummary = rankingList
      .map((item, idx) => `อันดับ ${idx + 1}: ${item.label} (${item.value})`)
      .join(", ");
    const summary = `หนูลองเรียงลำดับจากมากไปน้อยได้ดังนี้ครับ: ${rankingSummary}. ดังนั้น ลำดับที่ 1 คือ ${rankingList[0]?.label} และ ลำดับที่ 4 คือ ${rankingList[3]?.label}`;
    onApplyThoughtStep(summary);
  };

  // Canvas Scratchpad State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [penColor, setPenColor] = useState<string>("#3b82f6"); // Blue
  const [lineWidth, setLineWidth] = useState<number>(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background initially
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : penColor;
    ctx.lineWidth = tool === "eraser" ? 20 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#1e293b"];

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-amber-50/60 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
            🛠️ กระดานฝึกคิด & ทดเลข:
          </span>
        </div>
        <div className="flex items-center bg-white p-1 rounded-xl border border-amber-200 shadow-2xs">
          {question.tableData && question.tableData.length > 0 && (
            <button
              id="tab-interactive-ranking"
              onClick={() => {
                playPopSound();
                setActiveTab("ranking");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ranking"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📊 ลองจัดอันดับ
            </button>
          )}

          <button
            id="tab-interactive-scratchpad"
            onClick={() => {
              playPopSound();
              setActiveTab("scratchpad");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "scratchpad"
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✏️ กระดานวาด/ทดเลข
          </button>

          <button
            id="tab-interactive-placevalue"
            onClick={() => {
              playPopSound();
              setActiveTab("placevalue");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "placevalue"
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔢 ตัวช่วยดูหลักตัวเลข
          </button>
        </div>
      </div>

      {/* Tab 1: Ranking interactive tool */}
      {activeTab === "ranking" && (
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                ลาก/กดปุ่มขึ้นลงเพื่อจัดอันดับจาก <span className="text-amber-700 underline">มากที่สุด</span> ไปหา <span className="text-slate-500 underline">น้อยที่สุด</span>
              </h3>
              <p className="text-xs text-slate-500">
                สังเกตหลักหมื่น (ตัวหน้าสุด) ก่อน แล้วค่อยดูหลักพันนะครับ
              </p>
            </div>
            <button
              id="btn-reset-ranking"
              onClick={resetRanking}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>เริ่มใหม่</span>
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {rankingList.map((item, index) => {
              const rankColor =
                index === 0
                  ? "bg-amber-500 text-white"
                  : index === 1
                  ? "bg-amber-200 text-amber-900"
                  : index === 2
                  ? "bg-amber-100 text-amber-800"
                  : index === 3
                  ? "bg-orange-100 text-orange-900 font-bold border border-orange-300"
                  : "bg-slate-100 text-slate-600";

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankColor}`}>
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{item.label}</span>
                      <div className="text-xs text-slate-500 font-mono">
                        {item.value}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-rank-up-${index}`}
                      disabled={index === 0}
                      onClick={() => moveItem(index, "up")}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-amber-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-rank-down-${index}`}
                      disabled={index === rankingList.length - 1}
                      onClick={() => moveItem(index, "down")}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-amber-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-amber-900">
              💡 <span className="font-bold">จากการเรียง:</span> ลำดับที่ 1 คือ <span className="font-bold text-amber-700">{rankingList[0]?.label}</span> และ ลำดับที่ 4 คือ <span className="font-bold text-amber-700">{rankingList[3]?.label}</span>
            </div>
            <button
              id="btn-apply-ranking-thought"
              onClick={applyCurrentRankingToThought}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ใส่ในช่องวิธีคิด 📝</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Canvas Scratchpad */}
      {activeTab === "scratchpad" && (
        <div className="p-4 flex flex-col flex-1">
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                id="btn-tool-pen"
                onClick={() => {
                  playPopSound();
                  setTool("pen");
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tool === "pen"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>ปากกา</span>
              </button>

              <button
                id="btn-tool-eraser"
                onClick={() => {
                  playPopSound();
                  setTool("eraser");
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tool === "eraser"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>ยางลบ</span>
              </button>

              {/* Color Palette */}
              {tool === "pen" && (
                <div className="flex items-center gap-1.5 ml-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        penColor === c ? "scale-125 border-slate-800" : "border-white"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              id="btn-clear-canvas"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างกระดาน</span>
            </button>
          </div>

          {/* Canvas element */}
          <div className="relative border-2 border-dashed border-amber-200 rounded-xl overflow-hidden bg-white shadow-inner">
            <canvas
              ref={canvasRef}
              width={600}
              height={260}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[220px] sm:h-[260px] cursor-crosshair touch-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            💡 น้องๆ สามารถใช้เมาส์หรือนิ้วเขียนเลข ทดสูตร หรือวาดรูปบนนี้ได้เลยครับ!
          </p>
        </div>
      )}

      {/* Tab 3: Place Value Visualizer */}
      {activeTab === "placevalue" && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <span>🌟 ตารางเปรียบเทียบหลักตัวเลข (Place Values)</span>
            </h4>
            <p className="text-xs text-amber-800">
              เวลาเปรียบเทียบจำนวน ให้ดูจากหลักซ้ายสุด (หลักหมื่น) มาทางขวาตามลำดับ
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-amber-100/70 text-amber-900 font-bold">
                  <th className="p-2 border border-amber-200 text-left">ชื่อ</th>
                  <th className="p-2 border border-amber-200 bg-amber-200/60 text-amber-950 font-extrabold">หลักหมื่น</th>
                  <th className="p-2 border border-amber-200">หลักพัน</th>
                  <th className="p-2 border border-amber-200">หลักร้อย</th>
                  <th className="p-2 border border-amber-200">หลักสิบ</th>
                  <th className="p-2 border border-amber-200">หลักหน่วย</th>
                  <th className="p-2 border border-amber-200">รวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {question.tableData && question.tableData.length > 0 ? (
                  question.tableData.map((item, idx) => {
                    const numStr = item.value.replace(/[^0-9]/g, "");
                    const tenThousands = numStr.length >= 5 ? numStr[numStr.length - 5] : "0";
                    const thousands = numStr.length >= 4 ? numStr[numStr.length - 4] : "0";
                    const hundreds = numStr.length >= 3 ? numStr[numStr.length - 3] : "0";
                    const tens = numStr.length >= 2 ? numStr[numStr.length - 2] : "0";
                    const ones = numStr.length >= 1 ? numStr[numStr.length - 1] : "0";

                    return (
                      <tr key={idx} className="hover:bg-amber-50/50">
                        <td className="p-2 border border-amber-200 text-left font-bold text-slate-800">{item.label}</td>
                        <td className="p-2 border border-amber-200 font-bold text-amber-700 bg-amber-100/30 text-sm">{tenThousands}</td>
                        <td className="p-2 border border-amber-200 font-medium text-slate-700">{thousands}</td>
                        <td className="p-2 border border-amber-200 text-slate-500">{hundreds}</td>
                        <td className="p-2 border border-amber-200 text-slate-500">{tens}</td>
                        <td className="p-2 border border-amber-200 text-slate-500">{ones}</td>
                        <td className="p-2 border border-amber-200 font-bold text-slate-900">{item.value}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-slate-400">
                      ไม่มีตารางตัวเลขในข้อนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">📌 เคล็ดลับพี่ทอส:</span> ในข้อนี้ คนที่มีหลักหมื่นเป็นเลข 5 คือ พิมพ์ใจ (5) กับ ปรีชา (5) พอหลักหมื่นเท่ากัน ให้ไปดูหลักพันต่อครับ! พิมพ์ใจมีหลักพันเป็น 7 ส่วนปรีชามีหลักพันเป็น 4 ดังนั้น 57,413 ย่อมมากกว่า 54,173 เสมอ!
          </div>
        </div>
      )}
    </div>
  );
};
