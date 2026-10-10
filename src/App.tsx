/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Download,
  Play,
  Pause,
  CheckCircle2,
  DownloadCloud,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  Mic,
  GraduationCap,
  Clock,
  RotateCcw,
  Volume2,
  FileSpreadsheet,
  FileCheck2,
  Sliders,
  ChevronRight,
  ChevronDown,
  Info,
  Upload,
  FileCode,
  X,
  Printer,
  PackageCheck,
  AlertCircle,
  Eye,
  Edit3,
  Scale
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import mammoth from 'mammoth';
import { examSchema } from './utils/schema';
import {
  CURRICULUM_DATA,
  GradeCurriculum,
  UnitCurriculum
} from './data/curriculumData';
import {
  OfficialExamData,
  OFFICIAL_EXEMPLAR_THPT_11,
  OFFICIAL_EXEMPLAR_THCS_8,
  OFFICIAL_EXEMPLAR_TIEU_HOC_4
} from './data/officialExemplars';
import {
  downloadFullPackageDocx,
  downloadTestPaperDocx,
  downloadMatrixAndSpecDocx,
  downloadAnswerKeyDocx
} from './utils/exportWord';
import {
  generateListeningAudioBlob,
  triggerAudioDownload,
  concatenateWAVBlobs
} from './utils/audioHelper';
import { safeParseJson } from './utils/jsonRepair';

const ENGLISH_VOICES = {
  male: "Iapetus",
  female: "Erinome"
} as const;

type ActiveTab = 'paper' | 'matrix' | 'spec' | 'solution' | 'speaking';

// Helper component dàn phương án A B C D chuẩn in ấn và thẩm mỹ
const RenderQuestionOptions = ({ options }: { options?: string[] }) => {
  if (!options || options.length === 0) return null;

  const letters = ['A', 'B', 'C', 'D'];
  const formattedOptions = options.map((opt, idx) => {
    const trimmed = opt.trim();
    if (/^[A-D][\.\)\:]\s*/i.test(trimmed)) {
      return trimmed;
    }
    return `${letters[idx] || ''}. ${trimmed}`;
  });

  const maxLen = Math.max(...formattedOptions.map(o => o.length));
  const totalLen = formattedOptions.reduce((sum, o) => sum + o.length, 0);

  // 1. Dồn trên 1 dòng nếu ngắn (<= 32 ký tự hoặc tổng <= 110 ký tự) - đẹp, gọn, tiết kiệm trang in
  if ((maxLen <= 32 || totalLen <= 110) && formattedOptions.length === 4) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5 pl-2 text-xs text-slate-800 font-medium">
        {formattedOptions.map((opt, i) => {
          const match = opt.match(/^([A-D]\.)\s*(.*)$/);
          return (
            <div key={i} className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 truncate hover:border-blue-300 transition-colors" title={opt}>
              {match ? <><strong className="font-bold text-slate-900 mr-1">{match[1]}</strong><span>{match[2]}</span></> : opt}
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Dồn 2 dòng nếu vừa (<= 55 ký tự hoặc tổng <= 190 ký tự)
  if ((maxLen <= 55 || totalLen <= 190) && formattedOptions.length === 4) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 pl-2 text-xs text-slate-800 font-medium">
        {formattedOptions.map((opt, i) => {
          const match = opt.match(/^([A-D]\.)\s*(.*)$/);
          return (
            <div key={i} className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 hover:border-blue-300 transition-colors">
              {match ? <><strong className="font-bold text-slate-900 mr-1">{match[1]}</strong><span>{match[2]}</span></> : opt}
            </div>
          );
        })}
      </div>
    );
  }

  // 3. Mỗi dòng 1 phương án nếu dài
  return (
    <div className="grid grid-cols-1 gap-1.5 mt-1.5 pl-2 text-xs text-slate-800 font-medium">
      {formattedOptions.map((opt, i) => {
        const match = opt.match(/^([A-D]\.)\s*(.*)$/);
        return (
          <div key={i} className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 hover:border-blue-300 transition-colors">
            {match ? <><strong className="font-bold text-slate-900 mr-1">{match[1]}</strong><span>{match[2]}</span></> : opt}
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  // 1. Cấu hình cấp học & khối lớp
  const [level, setLevel] = useState<"Tiểu học" | "THCS" | "THPT">("THPT");
  const [grade, setGrade] = useState<string>("11");
  const [examPeriod, setExamPeriod] = useState<string>("Cuối học kì I");
  const [textbook, setTextbook] = useState<string>("Global Success (Kết nối tri thức)");
  const [duration, setDuration] = useState<number>(60);
  const [schoolName, setSchoolName] = useState<string>("");
  const [deptName, setDeptName] = useState<string>("");
  const [examCode, setExamCode] = useState<string>("111");
  
  // 1. Tỷ lệ nhận thức CV 7991: Cho phép giáo viên tự do điều chỉnh
  const [ratio, setRatio] = useState({ nb: 40, th: 30, vd: 30 });

  // 2. Cấu hình phân bổ điểm số 4 phân môn chuẩn CV 7991:
  // • Listening: 20% (~2.0đ)
  // • Language Focus: 20% - 30% (~2.0 - 3.0đ)
  // • Reading: 25% - 30% (~2.5 - 3.0đ)
  // • Writing: 20% - 25% (~2.0 - 2.5đ)
  // (Tiểu học: 2.5đ đều cho 4 kỹ năng = 25% mỗi kỹ năng)
  const [skillPoints, setSkillPoints] = useState({
    listening: 2.0,
    language: 3.0,
    reading: 3.0,
    writing: 2.0
  });

  // Tự cân đối tỉ lệ nhận thức về tổng 100%
  const handleBalanceRatio = () => {
    setRatio({ nb: 40, th: 30, vd: 30 });
    showToast("Đã cân đối lại Tỉ lệ nhận thức về chuẩn 40% NB - 30% TH - 30% VD (10.0đ)", "info");
  };

  // 3. Phụ lục 3 (Kế hoạch dạy học / Phân phối chương trình GDPT 2018) làm căn cứ ra đề
  const getDefaultPl3Content = (g: string, p: string) => {
    const curr = CURRICULUM_DATA[g];
    if (!curr) return "";
    const isMidTerm = p.toLowerCase().includes("giữa");
    const isTerm1 = p.toLowerCase().includes("i") && !p.toLowerCase().includes("ii");
    const units = isTerm1
      ? (isMidTerm ? curr.termUnits.midTerm1 : curr.termUnits.endTerm1)
      : (isMidTerm ? curr.termUnits.midTerm2 : curr.termUnits.endTerm2);
    const selectedUnits = curr.units.filter(u => units.includes(u.unit));
    return `PHỤ LỤC 3: KẾ HOẠCH DẠY HỌC MÔN TIẾNG ANH (THEO CHƯƠNG TRÌNH GDPT 2018)
Khối lớp: Lớp ${g} (${curr.level}) - Kì kiểm tra: ${p}
Thời gian làm bài: ${curr.defaultDuration} phút
Phạm vi bài học áp dụng: Các Unit ${units.join(", ")}

NỘI DUNG VÀ YÊU CẦU CẦN ĐẠT CỦA CÁC CHỦ ĐIỂM BÀI HỌC:
${selectedUnits.map(u => `[Unit ${u.unit}: ${u.title}]
- Ngữ âm (Pronunciation): ${u.pronunciation}
- Ngữ pháp trọng tâm (Grammar): ${u.grammar}
- Từ vựng theo chủ điểm (Vocabulary): ${u.vocabulary}
- Kỹ năng Đọc (Reading topic): ${u.readingTopic}
- Thể loại Viết (Writing genre): ${u.writingGenre}`).join("\n\n")}`;
  };

  const [pl3FileName, setPl3FileName] = useState<string | null>(null);
  const [pl3Content, setPl3Content] = useState<string>(() => getDefaultPl3Content("11", "Cuối học kì I"));
  const [isReadingPl3, setIsReadingPl3] = useState<boolean>(false);
  const [showPl3Modal, setShowPl3Modal] = useState<boolean>(false);
  const pl3FileInputRef = useRef<HTMLInputElement | null>(null);

  // 4. Yêu cầu thêm / Phạm vi trọng tâm (tùy chọn)
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast thông báo không dùng alert (tránh lỗi iframe)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Xem audio transcript
  const [showScriptPart1, setShowScriptPart1] = useState<boolean>(false);
  const [showScriptPart2, setShowScriptPart2] = useState<boolean>(false);

  // Cấu hình chi tiết từng phần thi (Có khác biệt rõ ràng Tiểu học, THCS và THPT)
  const [showPartConfig, setShowPartConfig] = useState<boolean>(true);
  const [partConfig, setPartConfig] = useState({
    // Tiểu học defaults (Chuẩn GDPT 2018 - sách Global Success)
    tieuhocListeningP1: 4, // Nghe và chọn True/False hoặc hình đúng
    tieuhocListeningP2: 4, // Nghe và chọn A, B, C
    tieuhocPhonetics: 4, // Âm vần, chữ cái (Phonics)
    tieuhocGrammarVocab: 4, // Từ vựng, Odd one out, điền câu đơn
    tieuhocReadingP1: 4, // Đọc câu nối tranh / Đúng - Sai
    tieuhocReadingP2: 4, // Đọc hiểu đoạn văn 40-60 từ
    tieuhocWritingP1: 4, // Sắp xếp chữ cái tạo từ
    tieuhocWritingP2: 4, // Sắp xếp từ thành câu đơn

    // THPT defaults
    thptListeningP1: 4, // True/False
    thptListeningP2: 4, // MCQ
    thptLanguageTextCount: 2, // 2 Quảng cáo/Thông báo
    thptLanguageQPerText: 6, // 6 câu mỗi bài = 12 câu
    thptReadingP1: 5, // Điền cụm từ/mệnh đề
    thptReadingP2: 7, // Đọc hiểu văn bản
    thptWritingP1: 4, // Sắp xếp câu
    thptWritingP2Type: "Viết bài báo/bài luận (120-150 từ)",

    // THCS defaults
    thcsListeningP1: 4, // True/False (80-100 từ)
    thcsListeningP2: 4, // MCQ (80-100 từ)
    thcsPhonetics: 4, // Phát âm & Trọng âm
    thcsGrammarVocab: 6, // Từ vựng & Ngữ pháp
    thcsReadingP1: 5, // Điền từ Cloze (80-100 từ)
    thcsReadingP2: 5, // Đọc hiểu (80-100 từ)
    thcsWritingP1: 4, // Tìm lỗi sai & Viết lại câu (KHÔNG có Nhận biết theo CV 7991)
    thcsWritingP2Type: "Viết đoạn văn ngắn (60-80 từ)"
  });

  // 5. Trạng thái Đề thi & Tab hiển thị (Xóa bỏ đề mẫu ban đầu, chỉ hiển thị đề mới tạo)
  const [activeTab, setActiveTab] = useState<ActiveTab>("paper");
  const [examData, setExamData] = useState<OfficialExamData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  // 6. Quản lý Audio nghe
  const [audioUrls, setAudioUrls] = useState<{ [key: number]: string }>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<{ [key: number]: boolean }>({ 1: false, 2: false });
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<number | null>(null);
  const audioElementsRef = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  // Cập nhật khối lớp khi đổi cấp học (không tự nạp đề mẫu cũ, giữ nguyên thông tin trường giáo viên đã điền)
  const handleLevelChange = (newLevel: "Tiểu học" | "THCS" | "THPT") => {
    setLevel(newLevel);
    if (newLevel === "Tiểu học") {
      setGrade("4");
      setDuration(35);
      setExamCode("301");
      setSkillPoints({ listening: 2.5, language: 2.5, reading: 2.5, writing: 2.5 });
      if (!pl3FileName) {
        setPl3Content(getDefaultPl3Content("4", examPeriod));
      }
    } else if (newLevel === "THCS") {
      setGrade("8");
      setDuration(45);
      setExamCode("801");
      setSkillPoints({ listening: 2.0, language: 2.5, reading: 2.5, writing: 3.0 });
      if (!pl3FileName) {
        setPl3Content(getDefaultPl3Content("8", examPeriod));
      }
    } else {
      setGrade("11");
      setDuration(60);
      setExamCode("111");
      setSkillPoints({ listening: 2.0, language: 3.0, reading: 3.0, writing: 2.0 });
      if (!pl3FileName) {
        setPl3Content(getDefaultPl3Content("11", examPeriod));
      }
    }
    stopAllAudio();
  };

  const handleGradeChange = (newGrade: string) => {
    setGrade(newGrade);
    const curr = CURRICULUM_DATA[newGrade];
    if (curr) {
      setDuration(curr.defaultDuration);
    }
    if (!pl3FileName) {
      setPl3Content(getDefaultPl3Content(newGrade, examPeriod));
    }
  };

  const handleExamPeriodChange = (newPeriod: string) => {
    setExamPeriod(newPeriod);
    if (!pl3FileName) {
      setPl3Content(getDefaultPl3Content(grade, newPeriod));
    }
  };

  // Dừng toàn bộ audio
  const stopAllAudio = () => {
    (Object.values(audioElementsRef.current) as (HTMLAudioElement | null)[]).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlayingAudio({ 1: false, 2: false });
  };

  // Xử lý upload File Phụ lục 3 (Word / Text)
  const handlePl3FileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsReadingPl3(true);

    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value.trim();
        if (text) {
          setPl3Content(text);
          setPl3FileName(file.name);
          showToast(`Đã trích xuất thành công Phụ lục 3 từ file Word "${file.name}"!`, "success");
        } else {
          showToast("File Word không chứa văn bản trích xuất được.", "error");
        }
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        if (text.trim()) {
          setPl3Content(text.trim());
          setPl3FileName(file.name);
          showToast(`Đã nạp văn bản Phụ lục 3 từ file "${file.name}"!`, "success");
        }
      } else {
        showToast("Vui lòng tải lên file định dạng Word (.docx) hoặc file văn bản (.txt).", "error");
      }
    } catch (err: any) {
      console.error("Lỗi đọc file Phụ lục 3:", err);
      showToast(`Không đọc được file: ${err?.message || "Lỗi định dạng"}`, "error");
    } finally {
      setIsReadingPl3(false);
      e.target.value = '';
    }
  };

  // Xử lý upload File Yêu cầu thêm / Trọng tâm (Word / Text)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsReadingFile(true);

    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value.trim();
        if (text) {
          setCustomPrompt(prev => prev ? `${prev}\n\n[Nội dung từ file ${file.name}]:\n${text}` : `[Nội dung từ file ${file.name}]:\n${text}`);
          setUploadedFileName(file.name);
          showToast(`Đã trích xuất thành công nội dung từ file Word "${file.name}"!`, "success");
        } else {
          showToast("File Word không chứa văn bản trích xuất được.", "error");
        }
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        setCustomPrompt(prev => prev ? `${prev}\n\n[Nội dung từ file ${file.name}]:\n${text}` : `[Nội dung từ file ${file.name}]:\n${text}`);
        setUploadedFileName(file.name);
        showToast(`Đã nạp văn bản từ file "${file.name}"!`, "success");
      } else {
        showToast("Vui lòng tải lên file định dạng Word (.docx) hoặc file văn bản (.txt).", "error");
      }
    } catch (err: any) {
      console.error("Lỗi đọc file:", err);
      showToast(`Không đọc được file: ${err?.message || "Lỗi định dạng"}`, "error");
    } finally {
      setIsReadingFile(false);
      e.target.value = '';
    }
  };

  // Lấy đề thi hiện tại hoặc nạp đề mẫu chuẩn tương ứng với cấp/lớp đang chọn
  const getActiveOrExemplarExam = (): OfficialExamData => {
    if (examData) return examData;
    const base = level === "Tiểu học"
      ? OFFICIAL_EXEMPLAR_TIEU_HOC_4
      : level === "THCS"
      ? OFFICIAL_EXEMPLAR_THCS_8
      : OFFICIAL_EXEMPLAR_THPT_11;

    const resolved: OfficialExamData = {
      ...base,
      level,
      grade,
      examPeriod,
      duration: duration || base.duration,
      schoolName: schoolName.trim(),
      departmentName: deptName.trim(),
      examCode: examCode.trim() || "111",
      year: "2026 - 2027",
      ratio
    };
    setExamData(resolved);
    return resolved;
  };

  // Xử lý xuất file Word (.docx) chuẩn CV 7991 (luôn hoạt động mượt mà)
  const handleDownloadDocx = async (action: 'full' | 'paper' | 'matrix' | 'key') => {
    try {
      const exam = getActiveOrExemplarExam();
      if (action === 'full') {
        showToast("Đang tạo và tải về trọn bộ hồ sơ đề thi Word (.docx)...", "info");
        await downloadFullPackageDocx(exam);
      } else if (action === 'paper') {
        showToast("Đang tải về đề kiểm tra Word (.docx)...", "info");
        await downloadTestPaperDocx(exam);
      } else if (action === 'matrix') {
        showToast("Đang tải về Ma trận & Bản đặc tả Word (.docx)...", "info");
        await downloadMatrixAndSpecDocx(exam);
      } else if (action === 'key') {
        showToast("Đang tải về Đáp án & Lời giải chi tiết Word (.docx)...", "info");
        await downloadAnswerKeyDocx(exam);
      }
      showToast("Đã tải file Word về máy thành công!", "success");
    } catch (err: any) {
      console.error("Lỗi xuất file Word:", err);
      showToast(`Lỗi tải file Word: ${err?.message || "Vui lòng thử lại"}`, "error");
    }
  };

  // Xử lý tạo âm thanh bài nghe với Gemini TTS (có fallback WAV chuẩn)
  const handleAudioAction = async (partNum: number, action: 'play' | 'download') => {
    const exam = getActiveOrExemplarExam();

    let finalUrl = audioUrls[partNum];
    let audioBlob: Blob | null = null;

    if (!finalUrl) {
      if (isGeneratingAudio !== null) return;
      setIsGeneratingAudio(partNum);
      try {
        const text = partNum === 1
          ? exam.listening.part1.script
          : exam.listening.part2.script;

        audioBlob = await generateListeningAudioBlob(text);
        finalUrl = URL.createObjectURL(audioBlob);
        setAudioUrls(prev => ({ ...prev, [partNum]: finalUrl }));
      } catch (err: any) {
        console.error("Lỗi tạo audio:", err);
        showToast("Không tạo được âm thanh lúc này. Vui lòng thử lại!", "error");
        setIsGeneratingAudio(null);
        return;
      }
      setIsGeneratingAudio(null);
    }

    if (action === 'download') {
      try {
        if (!audioBlob) {
          const res = await fetch(finalUrl);
          audioBlob = await res.blob();
        }
        const cleanCode = (exam.examCode || '111').replace(/[^a-zA-Z0-9]/g, '') || '111';
        const levelSlug = exam.level === "Tiểu học" ? "TieuHoc" : exam.level === "THCS" ? "THCS" : "THPT";
        triggerAudioDownload(
          audioBlob,
          `Listening_Part${partNum}_MaDe${cleanCode}_Lop${exam.grade}_${levelSlug}.wav`
        );
        showToast(`Đã tải file nghe Listening Part ${partNum} (.wav) về máy!`, "success");
      } catch (err: any) {
        console.error("Lỗi tải file audio:", err);
        showToast(`Lỗi tải file âm thanh: ${err?.message || "Vui lòng thử lại"}`, "error");
      }
    } else if (action === 'play') {
      let audio = audioElementsRef.current[partNum];
      if (!audio) {
        audio = new Audio(finalUrl);
        audio.onended = () => {
          setIsPlayingAudio(prev => ({ ...prev, [partNum]: false }));
        };
        audioElementsRef.current[partNum] = audio;
      }

      if (isPlayingAudio[partNum]) {
        audio.pause();
        setIsPlayingAudio(prev => ({ ...prev, [partNum]: false }));
      } else {
        const otherPart = partNum === 1 ? 2 : 1;
        if (audioElementsRef.current[otherPart]) {
          audioElementsRef.current[otherPart]!.pause();
          setIsPlayingAudio(prev => ({ ...prev, [otherPart]: false }));
        }
        audio.play().catch(e => {
          console.warn("Audio play blocked, retry:", e);
        });
        setIsPlayingAudio(prev => ({ ...prev, [partNum]: true }));
      }
    }
  };

  // Tải trọn bộ file âm thanh nghe (Ghép Part 1 + Part 2 thành 1 file WAV hoàn chỉnh)
  const handleDownloadAllAudio = async () => {
    const exam = getActiveOrExemplarExam();
    showToast("Đang kết xuất và ghép trọn bộ file âm thanh Part 1 & Part 2...", "info");
    setIsGeneratingAudio(3); // 3 = full composite audio
    try {
      const [blob1, blob2] = await Promise.all([
        generateListeningAudioBlob(exam.listening.part1.script),
        generateListeningAudioBlob(exam.listening.part2.script)
      ]);

      const combinedBlob = await concatenateWAVBlobs(blob1, blob2);
      const cleanCode = (exam.examCode || '111').replace(/[^a-zA-Z0-9]/g, '') || '111';
      const levelSlug = exam.level === "Tiểu học" ? "TieuHoc" : exam.level === "THCS" ? "THCS" : "THPT";
      triggerAudioDownload(
        combinedBlob,
        `TronBo_Audio_Listening_MaDe${cleanCode}_Lop${exam.grade}_${levelSlug}.wav`
      );
      showToast("Đã tải trọn bộ file nghe bài thi (.wav) về máy thành công!", "success");
    } catch (err: any) {
      console.error("Lỗi tải trọn bộ audio:", err);
      showToast("Đang tải riêng file nghe Part 1...", "info");
      await handleAudioAction(1, 'download');
    } finally {
      setIsGeneratingAudio(null);
    }
  };

  // AI Sinh đề thi mới theo Công văn 7991
  const handleGenerateExamWithAI = async () => {
    setIsGenerating(true);
    setGenerationProgress("Đang phân tích cấu trúc đề và cấu hình các phần thi...");
    stopAllAudio();
    setAudioUrls({});

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Với vai trò là Chuyên gia Khảo thí và Giáo viên Tiếng Anh cốt cán cấp ${level}, hãy biên soạn bộ hồ sơ đề kiểm tra định kỳ hoàn chỉnh môn Tiếng Anh theo đúng chuẩn CÔNG VĂN SỐ 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GD&ĐT${level === 'Tiểu học' ? ' (vận dụng phù hợp chuẩn kiến thức kỹ năng và định hướng khảo thí Tiểu học GDPT 2018)' : ''}.

THÔNG SỐ ĐẦU VÀO:
- Cấp học: ${level} (${level === 'THCS' ? 'Trung học cơ sở' : level === 'THPT' ? 'Trung học phổ thông' : 'Cấp Tiểu học'})
- Khối lớp: Lớp ${grade}
- Kì kiểm tra: ${examPeriod}
- Bộ sách giáo khoa: ${textbook}
- Thời gian làm bài: ${duration} phút
- Đơn vị ra đề: ${deptName} - ${schoolName}

CĂN CỨ BẮT BUỘC ĐỂ RA ĐỀ (THEO QUY ĐỊNH CỦA BỘ GD&ĐT):
1. PHỤ LỤC 3 - KẾ HOẠCH DẠY HỌC & CHƯƠNG TRÌNH GDPT 2018 (BẮT BUỘC BÁM SÁT):
${pl3Content}

2. TỈ LỆ CẤP ĐỘ NHẬN THỨC CV 7991 (GIÁO VIÊN THIẾT LẬP):
- Nhận biết: ${ratio.nb}% (${(ratio.nb * 0.1).toFixed(1)} điểm)
- Thông hiểu: ${ratio.th}% (${(ratio.th * 0.1).toFixed(1)} điểm)
- Vận dụng: ${ratio.vd}% (${(ratio.vd * 0.1).toFixed(1)} điểm)
(Tổng điểm: 10.0 điểm = 100%. TUYỆT ĐỐI LOẠI BỎ cấp độ Vận dụng cao).

3. CẤU HÌNH ĐIỂM SỐ VÀ CÁC PHẦN THI ĐÚNG QUY CHUẨN:
• Listening (Nghe): ${skillPoints.listening.toFixed(1)} điểm (${Math.round(skillPoints.listening * 10)}% tổng số điểm, gồm dạng câu hỏi trắc nghiệm MCQ hoặc Đúng/Sai).
  * Part 1: ${level === 'THPT' ? partConfig.thptListeningP1 : level === 'Tiểu học' ? partConfig.tieuhocListeningP1 : partConfig.thcsListeningP1} câu Đúng/Sai (True/False hoặc chọn hình đúng) có script đầy đủ.
  * Part 2: ${level === 'THPT' ? partConfig.thptListeningP2 : level === 'Tiểu học' ? partConfig.tieuhocListeningP2 : partConfig.thcsListeningP2} câu Trắc nghiệm ${level === 'Tiểu học' ? '3 lựa chọn (A, B, C)' : 'MCQ 4 lựa chọn (A, B, C, D)'}.
• Language Focus (Ngữ âm, Từ vựng, Ngữ pháp): ${skillPoints.language.toFixed(1)} điểm (${Math.round(skillPoints.language * 10)}% tổng số điểm).
  ${level === 'THPT' ? `* Gồm ${partConfig.thptLanguageTextCount} văn bản ngắn dạng Quảng cáo/Thông báo thực tế, tổng ${partConfig.thptLanguageTextCount * partConfig.thptLanguageQPerText} câu hỏi điền từ kiểm tra thì, ngữ pháp, từ vựng theo chủ đề Phụ lục 3.` : level === 'Tiểu học' ? `* Gồm ${partConfig.tieuhocPhonetics} câu Ngữ âm/âm chữ cái (Phonics) và ${partConfig.tieuhocGrammarVocab} câu Từ vựng & Mẫu câu (Odd one out, điền câu đơn) bám sát Phụ lục 3.` : `* Gồm ${partConfig.thcsPhonetics} câu Ngữ âm (phát âm & trọng âm) và ${partConfig.thcsGrammarVocab} câu Từ vựng & Ngữ pháp bám sát Phụ lục 3.`}
• Reading (Đọc hiểu): ${skillPoints.reading.toFixed(1)} điểm (${Math.round(skillPoints.reading * 10)}% tổng số điểm).
  * Part 1: ${level === 'THPT' ? `${partConfig.thptReadingP1} câu điền cụm từ/mệnh đề vào đoạn văn khoảng 230 từ` : level === 'Tiểu học' ? `${partConfig.tieuhocReadingP1} câu đọc câu nối tranh / xác định Đúng - Sai (True/False)` : `${partConfig.thcsReadingP1} câu Cloze test điền từ vào đoạn văn 80-100 từ`}.
  * Part 2: ${level === 'THPT' ? `${partConfig.thptReadingP2} câu đọc hiểu trả lời câu hỏi A, B, C, D đoạn văn khoảng 250-280 từ` : level === 'Tiểu học' ? `${partConfig.tieuhocReadingP2} câu đọc hiểu đoạn văn ngắn 40-60 từ trả lời câu hỏi A, B, C` : `${partConfig.thcsReadingP2} câu đọc hiểu đoạn văn 80-100 từ`}.
• Writing (Viết): ${skillPoints.writing.toFixed(1)} điểm (${Math.round(skillPoints.writing * 10)}% tổng số điểm).
  * Part 1: ${level === 'THPT' ? `${partConfig.thptWritingP1} câu sắp xếp câu thành văn bản hoàn chỉnh` : level === 'Tiểu học' ? `${partConfig.tieuhocWritingP1} câu sắp xếp các chữ cái tạo từ đúng chính tả` : `${partConfig.thcsWritingP1} câu tìm lỗi sai & viết lại câu`}.
  * LƯU Ý BẮT BUỘC CV 7991: RIÊNG PHÂN MÔN VIẾT (WRITING) TUYỆT ĐỐI KHÔNG CÓ CẤP ĐỘ NHẬN BIẾT. Bắt đầu từ Thông hiểu và Vận dụng.
  * Part 2: ${level === 'Tiểu học' ? `${partConfig.tieuhocWritingP2} câu sắp xếp từ thành câu đơn hoàn chỉnh` : `Viết đoạn văn ngắn (${level === 'THPT' ? '120-150 từ' : '60-80 từ'}) có rubric thang điểm chi tiết và bài mẫu tham khảo`}.

4. YÊU CẦU THÊM / PHẠM VI TRỌNG TÂM TỪ GIÁO VIÊN (TÙY CHỌN):
${customPrompt || "Bám sát phân phối chương trình, chủ điểm bài học trong Phụ lục 3, sử dụng ngữ liệu authentic phù hợp lứa tuổi."}

QUY CHUẨN KỸ THUẬT BẮT BUỘC THEO CV 7991:
1. LOẠI BỎ HOÀN TOÀN CẤP ĐỘ "VẬN DỤNG CAO". Chỉ dùng đúng 3 cấp độ: Nhận biết, Thông hiểu, Vận dụng.
2. RIÊNG PHÂN MÔN VIẾT (WRITING): TUYỆT ĐỐI KHÔNG CÓ CẤP ĐỘ "NHẬN BIẾT". Bắt đầu từ Thông hiểu và Vận dụng.
3. BẮT BUỘC CUNG CẤP ĐẦY ĐỦ:
- Khung Ma trận đề (Phụ lục 1 CV 7991) với các dòng kỹ năng có điểm số và % đúng cấu hình (${skillPoints.listening}đ Nghe, ${skillPoints.language}đ Ngôn ngữ, ${skillPoints.reading}đ Đọc, ${skillPoints.writing}đ Viết).
- Bản đặc tả đề (Phụ lục 2 CV 7991 với YCCĐ chuẩn GDPT 2018 theo Phụ lục 3)
- Đề kiểm tra chi tiết từng câu, các đáp án trắc nghiệm ngắn bố trí gọn gàng
- Đáp án và Hướng dẫn giải chi tiết cho TỪNG CÂU (tại sao đúng, dẫn chứng trích xuất từ bài đọc/bài nghe, kiến thức ngữ pháp/từ vựng cần nhớ)
- Tiêu chí chấm bài viết (Writing Rubrics) và Bài viết mẫu tham khảo.
${examPeriod.includes("Cuối") ? '- Bổ trợ Kỹ năng Nói (Speaking Test 2.0 điểm) gồm Part 1 Giới thiệu bản thân và Part 2 Thuyết trình chủ đề bốc thăm.' : ''}

LƯU Ý ĐẶC BIỆT VỀ ĐỘ DÀI:
- Nội dung giải thích từng câu (explanation, evidence, knowledgePoint) cần viết ngắn gọn, cô đọng (1-2 câu), tập trung vào trọng tâm câu hỏi để bảo đảm đề thi tải về đầy đủ và không bị đứt đoạn giữa chừng.

Hãy trả về đúng định dạng JSON theo schema đã chỉ định.`;

      setGenerationProgress("Mô hình AI đang biên soạn Ma trận, Bản đặc tả và Nội dung đề thi...");

      const modelsToTry = [
        "gemini-3.8-flash",
        "gemini-flash-latest"
      ];

      let response = null;
      let lastErr = null;

      for (const m of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: m,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: examSchema,
              temperature: 0.65,
              maxOutputTokens: 65536
            }
          });
          if (response?.text) break;
        } catch (e: any) {
          console.warn(`Model ${m} lỗi:`, e?.message || e);
          lastErr = e;
        }
      }

      if (!response?.text) {
        throw lastErr || new Error("Không thể kết nối đến máy chủ AI.");
      }

      const parsed: any = safeParseJson(response.text);

      if (!parsed) {
        throw new Error("Phản hồi từ AI chưa hoàn chỉnh, vui lòng thử lại để AI tạo đề đầy đủ.");
      }

      const baseExemplar = level === "THPT"
        ? OFFICIAL_EXEMPLAR_THPT_11
        : level === "Tiểu học"
        ? OFFICIAL_EXEMPLAR_TIEU_HOC_4
        : OFFICIAL_EXEMPLAR_THCS_8;

      const formattedExam: OfficialExamData = {
        id: `ai-gen-${Date.now()}`,
        level: level,
        grade: grade,
        examPeriod: examPeriod,
        schoolName: schoolName.trim(),
        departmentName: deptName.trim(),
        examCode: examCode.trim() || "111",
        duration: duration || baseExemplar.duration,
        year: "2026 - 2027",
        ratio: ratio,
        matrix: (parsed.matrix && parsed.matrix.length > 0) ? parsed.matrix : baseExemplar.matrix,
        spec: (parsed.spec && parsed.spec.length > 0) ? parsed.spec : baseExemplar.spec,
        listening: (parsed.listening?.part1?.questions?.length || parsed.listening?.part2?.questions?.length) ? parsed.listening : baseExemplar.listening,
        language: parsed.language ? parsed.language : baseExemplar.language,
        reading: (parsed.reading?.part1?.questions?.length || parsed.reading?.part2?.questions?.length) ? parsed.reading : baseExemplar.reading,
        writing: (parsed.writing?.part1?.questions?.length || parsed.writing?.part2?.answer) ? parsed.writing : baseExemplar.writing,
        speaking: parsed.speaking ? parsed.speaking : baseExemplar.speaking
      };

      setExamData(formattedExam);
      setActiveTab("paper");
      showToast(`Đã sinh thành công Bộ hồ sơ Đề kiểm tra môn Tiếng Anh Lớp ${grade} (${level}) chuẩn CV 7991!`, "success");
    } catch (err: any) {
      console.error("Lỗi sinh đề AI:", err);
      showToast(`Lỗi khi tạo đề bằng AI: ${err?.message || "Vui lòng thử lại"}. Hệ thống giữ nguyên đề chuẩn hiện tại.`, "error");
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 flex flex-col bg-slate-50">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                Tạo Đề Thi Môn Tiếng Anh Theo CV 7991
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 hidden sm:inline-block">
                  Bộ GD&ĐT
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Chuẩn hóa Ma trận • Bản đặc tả • Đề thi • Hướng dẫn giải chi tiết (TH, THCS & THPT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadDocx('full')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Xuất Trọn Bộ File Word (.docx)</span>
              <span className="md:hidden">Xuất Word</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        
        {/* Hướng dẫn ngắn gọn dành cho Giáo viên */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-blue-950">
                Hướng dẫn nhanh dành cho Giáo viên:
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 w-fit flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
              Chuẩn GDPT 2018 & CV 7991
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-slate-900 block font-semibold">Chọn Cấp & Số phút</strong>
                <span className="text-slate-600 text-[11px] leading-relaxed">Chọn Tiểu học, THCS hoặc THPT; chọn Khối lớp và tự điền số phút làm bài.</span>
              </div>
            </div>

            <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-slate-900 block font-semibold">Căn cứ Phụ lục 3</strong>
                <span className="text-slate-600 text-[11px] leading-relaxed">Tải file Kế hoạch dạy học Word (.docx) hoặc chỉnh sửa nội dung/tỉ lệ nhận thức.</span>
              </div>
            </div>

            <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-slate-900 block font-semibold">Bấm "AI Tạo Đề Thi"</strong>
                <span className="text-slate-600 text-[11px] leading-relaxed">AI tự động tạo đồng bộ: Đề thi, Ma trận (PL1), Bản đặc tả (PL2) và Hướng dẫn giải.</span>
              </div>
            </div>

            <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-slate-900 block font-semibold">Tải File Word & Nghe</strong>
                <span className="text-slate-600 text-[11px] leading-relaxed">Xuất trọn bộ file Word (.docx) chuẩn in ấn và tải File nghe audio (.wav) về máy.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT CẤU HÌNH BÊN TRÁI (4 CỘT) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Box Thiết lập thông số */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Cấu hình Kiểm tra Định kỳ
                </h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                  {level}
                </span>
              </div>

              {/* Chọn cấp học: Tiểu học / THCS / THPT */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Cấp học
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleLevelChange("Tiểu học")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      level === "Tiểu học"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tiểu học (1 - 5)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLevelChange("THCS")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      level === "THCS"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    THCS (6 - 9)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLevelChange("THPT")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      level === "THPT"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    THPT (10 - 12)
                  </button>
                </div>
              </div>

              {/* Khối lớp & Thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Khối lớp</label>
                  <select
                    value={grade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {level === "Tiểu học" ? (
                      <>
                        <option value="3">Lớp 3</option>
                        <option value="4">Lớp 4</option>
                        <option value="5">Lớp 5</option>
                        <option value="1">Lớp 1 (Làm quen)</option>
                        <option value="2">Lớp 2 (Làm quen)</option>
                      </>
                    ) : level === "THCS" ? (
                      <>
                        <option value="6">Lớp 6</option>
                        <option value="7">Lớp 7</option>
                        <option value="8">Lớp 8</option>
                        <option value="9">Lớp 9</option>
                      </>
                    ) : (
                      <>
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Thời gian (phút)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={duration || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDuration(isNaN(val) ? 0 : val);
                      }}
                      placeholder="Số phút"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                      phút
                    </span>
                  </div>
                </div>
              </div>

              {/* Kỳ kiểm tra */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kỳ kiểm tra</label>
                <select
                  value={examPeriod}
                  onChange={(e) => handleExamPeriodChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Giữa học kì I">Giữa học kì I</option>
                  <option value="Cuối học kì I">Cuối học kì I</option>
                  <option value="Giữa học kì II">Giữa học kì II</option>
                  <option value="Cuối học kì II">Cuối học kì II</option>
                </select>
              </div>

              {/* Bộ sách giáo khoa - Mặc định Global Success */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bộ sách giáo khoa</label>
                <select
                  value={textbook}
                  onChange={(e) => setTextbook(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Global Success (Kết nối tri thức)">Global Success (Kết nối tri thức)</option>
                </select>
              </div>

              {/* Thông tin Sở GD&ĐT, Tên trường (để trống tự điền) & Mã đề */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Sở GD&ĐT <span className="text-[10px] text-slate-400 font-normal">(tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="Để trống (tự điền)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mã đề thi</label>
                    <input
                      type="text"
                      value={examCode}
                      onChange={(e) => setExamCode(e.target.value)}
                      placeholder="111"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên trường <span className="text-[10px] text-slate-400 font-normal">(để trống giáo viên tự điền)</span>
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Để trống (Giáo viên tự điền)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 1. TỈ LỆ NHẬN THỨC CV 7991 (CHO PHÉP GIÁO VIÊN ĐIỀU CHỈNH) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      Tỉ lệ Nhận thức (CV 7991)
                    </span>
                    <p className="text-[10px] text-slate-500">Giáo viên tự do điều chỉnh theo yêu cầu đề thi</p>
                  </div>
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {ratio.nb}% - {ratio.th}% - {ratio.vd}%
                  </span>
                </div>

                {/* Các nút tỉ lệ chuẩn */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500 font-medium text-[10px] shrink-0">Gợi ý chuẩn:</span>
                  <button
                    type="button"
                    onClick={() => setRatio({ nb: 40, th: 30, vd: 30 })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      ratio.nb === 40 && ratio.th === 30 && ratio.vd === 30
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                    title="Chuẩn phổ biến CV 7991 (4.0đ - 3.0đ - 3.0đ)"
                  >
                    40:30:30
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatio({ nb: 50, th: 30, vd: 20 })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      ratio.nb === 50 && ratio.th === 30 && ratio.vd === 20
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                    title="Chuẩn cơ bản (5.0đ - 3.0đ - 2.0đ)"
                  >
                    50:30:20
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatio({ nb: 30, th: 40, vd: 30 })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      ratio.nb === 30 && ratio.th === 40 && ratio.vd === 30
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                    title="Chuẩn nâng cao (3.0đ - 4.0đ - 3.0đ)"
                  >
                    30:40:30
                  </button>
                </div>

                {/* 3 Thẻ điều chỉnh trực tiếp % nhận thức */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Nhận biết */}
                  <div className="bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 space-y-1">
                    <div className="text-[11px] font-semibold text-emerald-700">Nhận biết</div>
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={10}
                        max={80}
                        step={5}
                        value={ratio.nb}
                        onChange={(e) => setRatio({ ...ratio, nb: parseInt(e.target.value) || 0 })}
                        className="w-12 text-center font-bold text-sm bg-white border border-emerald-300 rounded p-0.5 text-emerald-900"
                      />
                      <span className="font-bold text-xs">%</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-800">
                      {(ratio.nb * 0.1).toFixed(1)} đ
                    </div>
                  </div>

                  {/* Thông hiểu */}
                  <div className="bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200 space-y-1">
                    <div className="text-[11px] font-semibold text-amber-700">Thông hiểu</div>
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={10}
                        max={80}
                        step={5}
                        value={ratio.th}
                        onChange={(e) => setRatio({ ...ratio, th: parseInt(e.target.value) || 0 })}
                        className="w-12 text-center font-bold text-sm bg-white border border-amber-300 rounded p-0.5 text-amber-900"
                      />
                      <span className="font-bold text-xs">%</span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-800">
                      {(ratio.th * 0.1).toFixed(1)} đ
                    </div>
                  </div>

                  {/* Vận dụng */}
                  <div className="bg-purple-50 text-purple-900 p-2 rounded-xl border border-purple-200 space-y-1">
                    <div className="text-[11px] font-semibold text-purple-700">Vận dụng</div>
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={10}
                        max={80}
                        step={5}
                        value={ratio.vd}
                        onChange={(e) => setRatio({ ...ratio, vd: parseInt(e.target.value) || 0 })}
                        className="w-12 text-center font-bold text-sm bg-white border border-purple-300 rounded p-0.5 text-purple-900"
                      />
                      <span className="font-bold text-xs">%</span>
                    </div>
                    <div className="text-[11px] font-bold text-purple-800">
                      {(ratio.vd * 0.1).toFixed(1)} đ
                    </div>
                  </div>
                </div>

                {/* Kiểm tra tổng 100% */}
                {ratio.nb + ratio.th + ratio.vd !== 100 ? (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Tổng hiện tại: {ratio.nb + ratio.th + ratio.vd}% (Chưa đạt 100%)
                    </span>
                    <button
                      type="button"
                      onClick={handleBalanceRatio}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] cursor-pointer"
                    >
                      Cân đối 100%
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-700 text-center font-medium">
                    ✓ Tổng tỉ lệ đạt chuẩn 100% (Thang điểm 10.0 - Loại bỏ Vận dụng cao theo CV 7991)
                  </div>
                )}
              </div>

              {/* 2. CẤU HÌNH BÀI KIỂM TRA (4 PHÂN MÔN CHUẨN CV 7991) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPartConfig(!showPartConfig)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Cấu hình 4 phân môn kiểm tra ({level})</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPartConfig ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                      {(skillPoints.listening + skillPoints.language + skillPoints.reading + skillPoints.writing).toFixed(1)} / 10.0 đ
                    </span>
                  </div>
                </div>

                {showPartConfig && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    
                    {/* Gợi ý phân bổ điểm số 4 kỹ năng */}
                    <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Phân bổ điểm 4 kỹ năng:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (level === "Tiểu học") {
                                setSkillPoints({ listening: 2.5, language: 2.5, reading: 2.5, writing: 2.5 });
                              } else if (level === "THPT") {
                                setSkillPoints({ listening: 2.0, language: 3.0, reading: 3.0, writing: 2.0 });
                              } else {
                                setSkillPoints({ listening: 2.0, language: 2.5, reading: 2.5, writing: 3.0 });
                              }
                              showToast(`Đã áp dụng chuẩn phân bổ điểm ${level}`, "info");
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                          >
                            Chuẩn {level}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSkillPoints({ listening: 2.5, language: 2.5, reading: 2.5, writing: 2.5 });
                              showToast("Đã áp dụng phân bổ điểm Cân bằng 4 kỹ năng (2.5đ mỗi kỹ năng)", "info");
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                          >
                            Cân bằng (2.5đ)
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold">
                        <div className="bg-blue-50 text-blue-800 p-1 rounded">Nghe: {skillPoints.listening}đ</div>
                        <div className="bg-amber-50 text-amber-800 p-1 rounded">Ngôn ngữ: {skillPoints.language}đ</div>
                        <div className="bg-emerald-50 text-emerald-800 p-1 rounded">Đọc: {skillPoints.reading}đ</div>
                        <div className="bg-purple-50 text-purple-800 p-1 rounded">Viết: {skillPoints.writing}đ</div>
                      </div>
                    </div>

                    {/* Phân môn 1: LISTENING */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-blue-900 border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                          1. Listening (Nghe)
                        </span>
                        <div className="flex items-center gap-1">
                          {[1.5, 2.0, 2.5].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setSkillPoints({ ...skillPoints, listening: pts })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                skillPoints.listening === pts
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {pts}đ
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {level === "Tiểu học"
                          ? `Chiếm ~25% tổng điểm (${skillPoints.listening.toFixed(1)}đ, gồm nghe chọn Đúng/Sai và trắc nghiệm A,B,C).`
                          : `Chiếm 20% tổng số điểm (${skillPoints.listening.toFixed(1)}đ ~ ${((skillPoints.listening / 10) * 100).toFixed(0)}%, gồm trắc nghiệm MCQ hoặc Đúng/Sai).`}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {level === "Tiểu học" ? "Part 1 (Đúng/Sai hoặc hình):" : "Part 1 (True/False):"}
                          </span>
                          <input
                            type="number"
                            value={level === "THPT" ? partConfig.thptListeningP1 : level === "Tiểu học" ? partConfig.tieuhocListeningP1 : partConfig.thcsListeningP1}
                            onChange={e => {
                              const v = parseInt(e.target.value) || 4;
                              if (level === "THPT") setPartConfig({ ...partConfig, thptListeningP1: v });
                              else if (level === "Tiểu học") setPartConfig({ ...partConfig, tieuhocListeningP1: v });
                              else setPartConfig({ ...partConfig, thcsListeningP1: v });
                            }}
                            className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {level === "Tiểu học" ? "Part 2 (MCQ A,B,C):" : "Part 2 (MCQ A,B,C,D):"}
                          </span>
                          <input
                            type="number"
                            value={level === "THPT" ? partConfig.thptListeningP2 : level === "Tiểu học" ? partConfig.tieuhocListeningP2 : partConfig.thcsListeningP2}
                            onChange={e => {
                              const v = parseInt(e.target.value) || 4;
                              if (level === "THPT") setPartConfig({ ...partConfig, thptListeningP2: v });
                              else if (level === "Tiểu học") setPartConfig({ ...partConfig, tieuhocListeningP2: v });
                              else setPartConfig({ ...partConfig, thcsListeningP2: v });
                            }}
                            className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phân môn 2: LANGUAGE FOCUS */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-amber-900 border-b border-slate-100 pb-1">
                        <span>2. Language Focus (Ngữ âm, Từ vựng, Ngữ pháp)</span>
                        <div className="flex items-center gap-1">
                          {[2.0, 2.5, 3.0].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setSkillPoints({ ...skillPoints, language: pts })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                skillPoints.language === pts
                                  ? "bg-amber-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {pts}đ
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {level === "Tiểu học"
                          ? `Chiếm ~25% tổng điểm (${skillPoints.language}đ, gồm ngữ âm âm chữ cái và từ vựng/mẫu câu).`
                          : `Chiếm 20% - 30% tổng số điểm (${skillPoints.language}đ).`}
                      </p>
                      {level === "THPT" ? (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-slate-600 text-[11px] font-medium">Số bài QC/Thông báo:</span>
                            <input
                              type="number"
                              value={partConfig.thptLanguageTextCount}
                              onChange={e => setPartConfig({ ...partConfig, thptLanguageTextCount: parseInt(e.target.value) || 2 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-slate-600 text-[11px] font-medium">Số câu mỗi bài:</span>
                            <input
                              type="number"
                              value={partConfig.thptLanguageQPerText}
                              onChange={e => setPartConfig({ ...partConfig, thptLanguageQPerText: parseInt(e.target.value) || 6 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </div>
                        </div>
                      ) : level === "Tiểu học" ? (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-slate-600 text-[11px] font-medium">Ngữ âm & Âm chữ cái (Phonics):</span>
                            <input
                              type="number"
                              value={partConfig.tieuhocPhonetics}
                              onChange={e => setPartConfig({ ...partConfig, tieuhocPhonetics: parseInt(e.target.value) || 4 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-slate-600 text-[11px] font-medium">Từ vựng & Mẫu câu (Odd-one-out):</span>
                            <input
                              type="number"
                              value={partConfig.tieuhocGrammarVocab}
                              onChange={e => setPartConfig({ ...partConfig, tieuhocGrammarVocab: parseInt(e.target.value) || 4 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-slate-600 text-[11px] font-medium">Phát âm & Trọng âm:</span>
                            <input
                              type="number"
                              value={partConfig.thcsPhonetics}
                              onChange={e => setPartConfig({ ...partConfig, thcsPhonetics: parseInt(e.target.value) || 4 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-slate-600 text-[11px] font-medium">Từ vựng & Ngữ pháp:</span>
                            <input
                              type="number"
                              value={partConfig.thcsGrammarVocab}
                              onChange={e => setPartConfig({ ...partConfig, thcsGrammarVocab: parseInt(e.target.value) || 6 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phân môn 3: READING */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-slate-100 pb-1">
                        <span>3. Reading (Đọc hiểu)</span>
                        <div className="flex items-center gap-1">
                          {[2.0, 2.5, 3.0].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setSkillPoints({ ...skillPoints, reading: pts })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                skillPoints.reading === pts
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {pts}đ
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {level === "Tiểu học"
                          ? `Chiếm ~25% tổng số điểm (${skillPoints.reading}đ, gồm đọc nối câu/tranh và đọc hiểu đoạn văn 40-60 từ).`
                          : `Chiếm 25% - 30% tổng số điểm (${skillPoints.reading}đ, gồm đọc điền từ vào đoạn văn và đọc hiểu trả lời câu hỏi).`}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {level === "THPT" ? "Điền cụm từ/mệnh đề:" : level === "Tiểu học" ? "Đọc câu nối tranh / T-F:" : "Đọc điền từ Cloze:"}
                          </span>
                          <input
                            type="number"
                            value={level === "THPT" ? partConfig.thptReadingP1 : level === "Tiểu học" ? partConfig.tieuhocReadingP1 : partConfig.thcsReadingP1}
                            onChange={e => {
                              const v = parseInt(e.target.value) || 4;
                              if (level === "THPT") setPartConfig({ ...partConfig, thptReadingP1: v });
                              else if (level === "Tiểu học") setPartConfig({ ...partConfig, tieuhocReadingP1: v });
                              else setPartConfig({ ...partConfig, thcsReadingP1: v });
                            }}
                            className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {level === "Tiểu học" ? "Đọc hiểu đoạn 40-60 từ:" : "Đọc hiểu trả lời câu hỏi:"}
                          </span>
                          <input
                            type="number"
                            value={level === "THPT" ? partConfig.thptReadingP2 : level === "Tiểu học" ? partConfig.tieuhocReadingP2 : partConfig.thcsReadingP2}
                            onChange={e => {
                              const v = parseInt(e.target.value) || 4;
                              if (level === "THPT") setPartConfig({ ...partConfig, thptReadingP2: v });
                              else if (level === "Tiểu học") setPartConfig({ ...partConfig, tieuhocReadingP2: v });
                              else setPartConfig({ ...partConfig, thcsReadingP2: v });
                            }}
                            className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phân môn 4: WRITING */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-purple-900 border-b border-slate-100 pb-1">
                        <span>4. Writing (Viết)</span>
                        <div className="flex items-center gap-1">
                          {[2.0, 2.5, 3.0].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setSkillPoints({ ...skillPoints, writing: pts })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                skillPoints.writing === pts
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {pts}đ
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {level === "Tiểu học"
                          ? `Chiếm ~25% tổng điểm (${skillPoints.writing}đ, gồm sắp xếp chữ cái tạo từ và sắp xếp từ thành câu đơn).`
                          : `Chiếm 20% - 25% tổng số điểm (${skillPoints.writing}đ, viết lại câu, sắp xếp từ hoặc viết đoạn văn ngắn).`}
                      </p>
                      <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-[10px] font-medium text-rose-800">
                        ⚠️ Quy định CV 7991: Riêng phân môn Viết TUYỆT ĐỐI KHÔNG có cấp độ Nhận biết.
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {level === "THPT" ? "Sắp xếp câu viết:" : level === "Tiểu học" ? "Sắp xếp chữ cái tạo từ:" : "Tìm lỗi sai & Viết lại câu:"}
                          </span>
                          <input
                            type="number"
                            value={level === "THPT" ? partConfig.thptWritingP1 : level === "Tiểu học" ? partConfig.tieuhocWritingP1 : partConfig.thcsWritingP1}
                            onChange={e => {
                              const v = parseInt(e.target.value) || 4;
                              if (level === "THPT") setPartConfig({ ...partConfig, thptWritingP1: v });
                              else if (level === "Tiểu học") setPartConfig({ ...partConfig, tieuhocWritingP1: v });
                              else setPartConfig({ ...partConfig, thcsWritingP1: v });
                            }}
                            className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {level === "Tiểu học" ? "Sắp xếp từ thành câu đơn:" : "Viết bài luận / đoạn văn:"}
                          </span>
                          {level === "Tiểu học" ? (
                            <input
                              type="number"
                              value={partConfig.tieuhocWritingP2}
                              onChange={e => setPartConfig({ ...partConfig, tieuhocWritingP2: parseInt(e.target.value) || 4 })}
                              className="w-full mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          ) : (
                            <div className="mt-0.5 p-1 bg-slate-50 border border-slate-300 rounded text-[11px] font-semibold text-purple-800 truncate text-center">
                              {level === "THPT" ? "1 bài (120-150 từ)" : "1 bài (60-80 từ)"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Kiểm tra tổng điểm 4 kỹ năng = 10.0 */}
                    {Math.abs(skillPoints.listening + skillPoints.language + skillPoints.reading + skillPoints.writing - 10.0) > 0.05 ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          Tổng điểm: {(skillPoints.listening + skillPoints.language + skillPoints.reading + skillPoints.writing).toFixed(1)}đ (Chưa đạt 10.0đ)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (level === "Tiểu học") {
                              setSkillPoints({ listening: 2.5, language: 2.5, reading: 2.5, writing: 2.5 });
                            } else if (level === "THPT") {
                              setSkillPoints({ listening: 2.0, language: 3.0, reading: 3.0, writing: 2.0 });
                            } else {
                              setSkillPoints({ listening: 2.0, language: 2.5, reading: 2.5, writing: 3.0 });
                            }
                            showToast("Đã cân đối lại điểm 4 phân môn về chuẩn 10.0đ!", "info");
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] cursor-pointer"
                        >
                          Cân đối 10.0đ
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-700 text-center font-medium bg-emerald-50 py-1 rounded border border-emerald-200">
                        ✓ Tổng 4 phân môn đạt chuẩn 10.0 điểm (100% thang điểm đánh giá)
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* 3. UPLOAD FILE PHỤ LỤC 3 (CHƯƠNG TRÌNH / NỘI DUNG DẠY HỌC) * */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Upload File Phụ lục 3 (nội dung dạy học) <span className="text-rose-600 font-bold">*</span></span>
                    </label>
                    <p className="text-[10px] text-slate-500">Căn cứ cốt lõi để AI thiết lập ma trận, bản đặc tả và nội dung đề thi</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPl3Modal(true)}
                      className="text-xs text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 font-semibold px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Xem hoặc chỉnh sửa trực tiếp nội dung Phụ lục 3"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Xem/Sửa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => pl3FileInputRef.current?.click()}
                      disabled={isReadingPl3}
                      className="text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isReadingPl3 ? "Đang đọc..." : "Upload Phụ lục 3"}</span>
                    </button>
                    <input
                      ref={pl3FileInputRef}
                      type="file"
                      accept=".docx,.doc,.txt"
                      onChange={handlePl3FileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {pl3FileName ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="truncate">
                        Đã nạp Phụ lục 3: <strong className="font-bold">{pl3FileName}</strong>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPl3FileName(null);
                        setPl3Content(getDefaultPl3Content(grade, examPeriod));
                        showToast(`Đã khôi phục Phụ lục 3 chuẩn GDPT 2018 cho Lớp ${grade}!`, "info");
                      }}
                      className="p-1 hover:bg-emerald-200 rounded text-emerald-700 cursor-pointer transition-colors shrink-0"
                      title="Khôi phục Phụ lục 3 mặc định theo SGK"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] truncate">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">
                        Đang dùng <strong>Phụ lục 3 chuẩn GDPT 2018</strong> ({textbook} - Khối {grade})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPl3Modal(true)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer shrink-0 ml-1"
                    >
                      Chi tiết
                    </button>
                  </div>
                )}
              </div>

              {/* 4. YÊU CẦU THÊM / PHẠM VI TRỌNG TÂM (TÙY CHỌN) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Yêu cầu thêm / Phạm vi trọng tâm (tùy chọn)
                  </label>
                  
                  {/* Nút Upload File Word nổi bật */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isReadingFile}
                    className="text-xs text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>{isReadingFile ? "Đang trích xuất..." : "Upload File Word"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFileName && (
                  <div className="mb-2 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Đã nạp file yêu cầu: <strong className="font-bold">{uploadedFileName}</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setCustomPrompt("");
                        showToast("Đã xóa nội dung file Word yêu cầu đính kèm", "info");
                      }}
                      className="p-1 hover:bg-emerald-200 rounded text-emerald-700 cursor-pointer transition-colors"
                      title="Xóa nội dung file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Ví dụ: Tập trung vào từ vựng Unit 4 (ASEAN) và ngữ pháp câu bị động, mệnh đề phân từ Unit 5... Hoặc upload file Word câu hỏi để AI dựa vào.`}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* 5. NÚT HÀNH ĐỘNG TẠO ĐỀ THI VỚI AI (CĂN CỨ VÀO PHỤ LỤC 3 & YÊU CẦU THÊM) */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateExamWithAI}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {isGenerating ? "AI Đang Soạn Đề Theo CV 7991..." : "AI Tạo Đề Thi, Ma Trận & Bản Đặc Tả (CV 7991)"}
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Hệ thống căn cứ trực tiếp vào <strong>Phụ lục 3</strong>, <strong>Tỉ lệ nhận thức</strong> và <strong>Cấu hình 4 phân môn</strong> để ra đề.
                </p>
              </div>

              {isGenerating && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2.5 animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{generationProgress}</span>
                </div>
              )}
            </div>

            {/* 6. TÙY CHỌN XUẤT FILE WORD (.DOCX) CHUẨN CV 7991 - CÓ XUẤT TRỌN BỘ */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <DownloadCloud className="w-4 h-4 text-emerald-600" />
                Tùy chọn Xuất File Word (.docx) Chuẩn CV 7991
              </h3>

              {/* MỤC XUẤT TRỌN BỘ - NỔI BẬT NHẤT */}
              <button
                type="button"
                onClick={() => handleDownloadDocx('full')}
                className="w-full py-3 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>Xuất Trọn Bộ Hồ Sơ (Đầy Đủ 4 Trong 1)</span>
                </span>
                <span className="bg-emerald-800/40 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                  Mẫu CV 7991
                </span>
              </button>

              {/* Các tùy chọn xuất từng phần riêng biệt */}
              <button
                type="button"
                onClick={() => handleDownloadDocx('paper')}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-blue-600" /> Chỉ Xuất Đề Kiểm Tra (Để in cho học sinh)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDocx('matrix')}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" /> Xuất Ma Trận & Bản Đặc Tả (Mẫu 7991)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDocx('key')}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><FileCheck2 className="w-3.5 h-3.5 text-emerald-600" /> Xuất Đáp Án & Hướng Dẫn Giải Chi Tiết</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Tùy chọn Tải File Nghe Listening (.wav) */}
              <div className="pt-1 space-y-1.5">
                <button
                  type="button"
                  onClick={handleDownloadAllAudio}
                  className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Tải Trọn Bộ File Nghe (.wav)</span>
                  </span>
                  <span className="bg-purple-200/70 text-[10px] px-2 py-0.5 rounded-md font-semibold text-purple-800">
                    Part 1 + Part 2
                  </span>
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAudioAction(1, 'download')}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-purple-600" />
                    Tải Part 1 (.wav)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAudioAction(2, 'download')}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-purple-600" />
                    Tải Part 2 (.wav)
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT NỘI DUNG CHÍNH (8 CỘT) */}
          <div className="lg:col-span-8 space-y-4">
            {!examData ? (
              <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 text-center space-y-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Khung Hiển Thị Đề Kiểm Tra & Ma Trận Mới Tạo (CV 7991)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Toàn bộ file mẫu cũ đã được xóa bỏ theo yêu cầu. Sau khi thầy/cô điều chỉnh cấu hình và bấm nút <strong>"AI Tạo Đề Thi, Ma Trận & Bản Đặc Tả (CV 7991)"</strong>, bộ hồ sơ đề thi mới sẽ hiển thị đầy đủ tại đây.
                  </p>
                </div>

                {/* 4 Khối hồ sơ sẽ tạo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left pt-1">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>1. Đề thi in ấn</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Đầy đủ 4 phân môn: Listening, Language, Reading, Writing.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>2. Ma trận đề</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Phụ lục 1 chuẩn 3 cấp độ: Nhận biết, Thông hiểu, Vận dụng.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>3. Bản đặc tả</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Phụ lục 2 chi tiết từng câu hỏi và chuẩn năng lực cần đạt.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>4. File nghe Audio</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Tải trực tiếp file âm thanh (.wav) và đáp án có lời giải.</p>
                  </div>
                </div>

                {/* Nút hành động trực tiếp */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerateExamWithAI}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isGenerating ? "AI Đang Soạn Đề Theo CV 7991..." : "Khởi Tạo Đề Kiểm Tra & Ma Trận Ngay (AI)"}</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Căn cứ vào Phụ lục 3, Tỉ lệ nhận thức ({ratio.nb}:{ratio.th}:{ratio.vd}) và Cấu hình 4 phân môn đã thiết lập.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs Điều Hướng */}
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('paper')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'paper'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Đề Kiểm Tra (Chuẩn in ấn)
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                Ma Trận (Phụ lục 1)
              </button>
              <button
                onClick={() => setActiveTab('spec')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'spec'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Bản Đặc Tả (Phụ lục 2)
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'solution'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Đáp Án & Lời Giải Chi Tiết
              </button>
              {examData.speaking && (
                <button
                  onClick={() => setActiveTab('speaking')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === 'speaking'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  Đánh Giá Kỹ Năng Nói
                </button>
              )}
            </div>

            {/* TAB 1: ĐỀ KIỂM TRA (TEST PAPER) */}
            {activeTab === 'paper' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-slate-200 space-y-8 font-serif">
                
                {/* Header Tiêu đề bài thi chuẩn phách Bộ GD&ĐT */}
                <div className="border-b-2 border-slate-800 pb-5 font-sans">
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-800">
                    <div className="text-center">
                      <div className="font-bold text-sm tracking-wide">
                        {examData.departmentName?.trim() && !examData.departmentName.toUpperCase().includes("PHÒNG")
                          ? (examData.departmentName.toUpperCase().startsWith("SỞ") ? examData.departmentName.toUpperCase() : `SỞ GD&ĐT ${examData.departmentName.toUpperCase()}`)
                          : "SỞ GD&ĐT: ...................................."}
                      </div>
                      <div className="font-bold">
                        {examData.schoolName?.trim()
                          ? (examData.schoolName.toUpperCase().startsWith("TRƯỜNG") ? examData.schoolName.toUpperCase() : `TRƯỜNG ${examData.schoolName.toUpperCase()}`)
                          : "TRƯỜNG: ...................................."}
                      </div>
                      <div className="font-bold text-red-700 mt-1">ĐỀ CHÍNH THỨC</div>
                      <div className="text-slate-500 italic">(Đề thi gồm có 4 trang)</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm text-slate-900">
                        ĐỀ KIỂM TRA {examData.examPeriod.toUpperCase()}
                      </div>
                      <div className="font-semibold">NĂM HỌC: {examData.year || "2026 - 2027"}</div>
                      <div className="font-bold text-blue-800">
                        MÔN: TIẾNG ANH KHỐI {examData.grade}
                      </div>
                      <div className="text-slate-600 italic">Thời gian làm bài: {examData.duration} phút</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-wrap justify-between items-center text-xs">
                    <div>Họ và tên học sinh: .............................................................. Lớp: .......... SBD: .........</div>
                    <div className="border-2 border-slate-800 px-3 py-1 font-bold text-sm text-slate-900 rounded">
                      Mã đề: {examData.examCode}
                    </div>
                  </div>
                </div>

                {/* A. LISTENING */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-sans">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white inline-flex items-center justify-center text-xs">A</span>
                      LISTENING
                    </h3>
                    <span className="text-xs text-slate-500 italic">Học sinh được nghe 2 lần cho mỗi phần</span>
                  </div>

                  {/* Part 1: Bảng True / False có ô tick như PDF 2 */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900">
                        1. There are four questions in this part. For each question, decide whether the statement is TRUE or FALSE. Tick (√) the correct boxes. You will listen to the recording twice. (1.0 point)
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAudioAction(1, 'play')}
                          disabled={isGeneratingAudio === 1}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isPlayingAudio[1] ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isGeneratingAudio === 1 ? "Đang tạo audio..." : isPlayingAudio[1] ? "Tạm dừng" : "Nghe Part 1"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAudioAction(1, 'download')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Tải audio bài nghe Part 1 (.wav)"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Tải Audio Part 1</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowScriptPart1(!showScriptPart1)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Xem Transcript bài nghe"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{showScriptPart1 ? "Ẩn Script" : "Xem Script"}</span>
                        </button>
                      </div>
                    </div>

                    {showScriptPart1 && (
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-800 space-y-1.5 font-sans">
                        <div className="font-bold text-blue-900 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" /> Kịch bản bài nghe (Listening Audio Script - Part 1):
                        </div>
                        <div className="whitespace-pre-line leading-relaxed text-slate-700 italic bg-white p-2.5 rounded border border-blue-100 font-serif">
                          {examData.listening.part1.script}
                        </div>
                      </div>
                    )}

                    {/* Bảng True / False chuẩn PDF 2 */}
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-xs border-collapse border border-slate-300 text-left">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                            <th className="border border-slate-300 p-2 text-left">STATEMENTS</th>
                            <th className="border border-slate-300 p-2 w-20">A(true)</th>
                            <th className="border border-slate-300 p-2 w-20">B(false)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examData.listening.part1.questions.map((q) => (
                            <tr key={q.id} className="hover:bg-white">
                              <td className="border border-slate-300 p-2 font-medium text-slate-900">{q.text}</td>
                              <td className="border border-slate-300 p-2 text-center text-slate-400"></td>
                              <td className="border border-slate-300 p-2 text-center text-slate-400"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Part 2: Multiple Choice */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900">{examData.listening.part2.title}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAudioAction(2, 'play')}
                          disabled={isGeneratingAudio === 2}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isPlayingAudio[2] ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isGeneratingAudio === 2 ? "Đang tạo audio..." : isPlayingAudio[2] ? "Tạm dừng" : "Nghe Part 2"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAudioAction(2, 'download')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Tải audio bài nghe Part 2 (.wav)"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Tải Audio Part 2</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowScriptPart2(!showScriptPart2)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Xem Transcript bài nghe"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{showScriptPart2 ? "Ẩn Script" : "Xem Script"}</span>
                        </button>
                      </div>
                    </div>

                    {showScriptPart2 && (
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-800 space-y-1.5 font-sans">
                        <div className="font-bold text-blue-900 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" /> Kịch bản bài nghe (Listening Audio Script - Part 2):
                        </div>
                        <div className="whitespace-pre-line leading-relaxed text-slate-700 italic bg-white p-2.5 rounded border border-blue-100 font-serif">
                          {examData.listening.part2.script}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      {examData.listening.part2.questions.map((q) => (
                        <div key={q.id} className="text-xs">
                          <div className="font-bold text-slate-900">{q.text}</div>
                          <RenderQuestionOptions options={q.options} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* B. LANGUAGE */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-slate-200 font-sans">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white inline-flex items-center justify-center text-xs">B</span>
                      LANGUAGE
                    </h3>
                  </div>

                  {examData.language.isModernFormat ? (
                    // THPT (2 bài Quảng cáo / Thông báo)
                    <div className="space-y-6 font-sans">
                      {examData.language.text1 && (
                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                          <div className="font-bold text-xs text-slate-900">{examData.language.text1.title}</div>
                          <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800 font-serif italic">
                            {examData.language.text1.passage}
                          </div>
                          <div className="space-y-2 pt-2">
                            {examData.language.text1.questions.map((q) => (
                              <div key={q.id} className="text-xs">
                                <span className="font-bold text-slate-900">{q.text}</span>
                                <RenderQuestionOptions options={q.options} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {examData.language.text2 && (
                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                          <div className="font-bold text-xs text-slate-900">{examData.language.text2.title}</div>
                          <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800 font-serif italic">
                            {examData.language.text2.passage}
                          </div>
                          <div className="space-y-2 pt-2">
                            {examData.language.text2.questions.map((q) => (
                              <div key={q.id} className="text-xs">
                                <span className="font-bold text-slate-900">{q.text}</span>
                                <RenderQuestionOptions options={q.options} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // THCS & Tiểu học (Phát âm, Trọng âm, Ngữ pháp, Từ vựng)
                    <div className="space-y-4 font-sans">
                      {examData.language.phonetics && (
                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                          <div className="font-bold text-xs text-slate-900">
                            {examData.level === "Tiểu học" ? "1. Phonics & Alphabet sounds (1.25 points):" : "1. Pronunciation & Stress (1.0 point):"}
                          </div>
                          {examData.language.phonetics.map((q) => (
                            <div key={q.id} className="text-xs">
                              <span className="font-bold text-slate-900">{q.text}</span>
                              <RenderQuestionOptions options={q.options} />
                            </div>
                          ))}
                        </div>
                      )}

                      {examData.language.grammarVocab && (
                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                          <div className="font-bold text-xs text-slate-900">
                            {examData.level === "Tiểu học" ? "2. Vocabulary & Sentence Patterns (1.25 points):" : "2. Vocabulary & Grammar (1.5 points):"}
                          </div>
                          {examData.language.grammarVocab.map((q) => (
                            <div key={q.id} className="text-xs">
                              <span className="font-bold text-slate-900">{q.text}</span>
                              <RenderQuestionOptions options={q.options} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* C. READING */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-slate-200 font-sans">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white inline-flex items-center justify-center text-xs">C</span>
                      READING
                    </h3>
                  </div>

                  {/* Reading Part 1 */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 font-sans">
                    <div className="font-bold text-xs text-slate-900">{examData.reading.part1.title}</div>
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800 font-serif">
                      {examData.reading.part1.passage}
                    </div>
                    <div className="space-y-3 pt-2">
                      {examData.reading.part1.questions.map((q) => (
                        <div key={q.id} className="text-xs">
                          <span className="font-bold text-slate-900">{q.text}</span>
                          <RenderQuestionOptions options={q.options} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reading Part 2 */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 font-sans">
                    <div className="font-bold text-xs text-slate-900">{examData.reading.part2.title}</div>
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800 font-serif">
                      {examData.reading.part2.passage}
                    </div>
                    <div className="space-y-3 pt-2">
                      {examData.reading.part2.questions.map((q) => (
                        <div key={q.id} className="text-xs">
                          <div className="font-bold text-slate-900">{q.text}</div>
                          <RenderQuestionOptions options={q.options} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* D. WRITING */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-slate-200 font-sans">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white inline-flex items-center justify-center text-xs">D</span>
                      WRITING
                    </h3>
                  </div>

                  {/* Part 1 */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 font-sans">
                    <div className="font-bold text-xs text-slate-900">
                      {examData.level === "THPT"
                        ? "1. Mark the letter A, B, C, or D on your answer sheet to indicate the correct arrangement of the sentences to make a meaningful paragraph/letter in each of the following questions (1 point):"
                        : examData.level === "Tiểu học"
                        ? "1. Reorder the letters to make correct words (1.25 points):"
                        : "1. Sentence transformation and Error correction (1 point):"}
                    </div>
                    <div className="space-y-4 pt-1">
                      {examData.writing.part1.map((q) => (
                        <div key={q.id} className="text-xs whitespace-pre-line">
                          <div className="font-bold text-slate-900">{q.text}</div>
                          <RenderQuestionOptions options={q.options} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 2: Controlled Writing */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 font-sans">
                    <div className="font-bold text-xs text-slate-900">{examData.writing.part2.prompt}</div>
                    <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300 min-h-[140px] text-xs text-slate-400 italic flex items-center justify-center">
                      (Khu vực học sinh làm bài viết tự luận)
                    </div>
                  </div>

                  <div className="text-center pt-4 font-sans text-xs text-slate-600 space-y-1">
                    <div className="font-bold tracking-widest uppercase">------------- The end -------------</div>
                    <div className="font-bold">Học sinh không được sử dụng tài liệu.</div>
                    <div>Cán bộ coi kiểm tra không giải thích gì thêm.</div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: KHUNG MA TRẬN ĐỀ (PHỤ LỤC 1 CV 7991) */}
            {activeTab === 'matrix' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-slate-200 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-xs font-bold text-slate-700">BỘ GIÁO DỤC VÀ ĐÀO TẠO</div>
                  <div className="text-xs font-semibold text-slate-500">PHỤ LỤC (Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)</div>
                  <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ KHỐI {examData.grade} ({examData.level})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-300 text-center">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <th rowSpan={2} className="border border-slate-300 p-2 w-8">TT</th>
                        <th rowSpan={2} className="border border-slate-300 p-2 text-left w-24">Kiến thức, Kỹ năng</th>
                        <th rowSpan={2} className="border border-slate-300 p-2 text-left">Nội dung/đơn vị kiến thức/dạng bài</th>
                        <th colSpan={9} className="border border-slate-300 p-2 bg-blue-50 text-blue-900">
                          Mức độ đánh giá
                        </th>
                        <th colSpan={3} className="border border-slate-300 p-2 bg-slate-200">Tổng</th>
                        <th rowSpan={2} className="border border-slate-300 p-2 w-14">Tỉ lệ % điểm</th>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-700">
                        <th colSpan={3} className="border border-slate-300 p-1">TNKQ nhiều lựa chọn</th>
                        <th colSpan={3} className="border border-slate-300 p-1">TNKQ “Đúng – Sai”</th>
                        <th colSpan={3} className="border border-slate-300 p-1">Tự luận</th>
                        <th className="border border-slate-300 p-1">Biết</th>
                        <th className="border border-slate-300 p-1">Hiểu</th>
                        <th className="border border-slate-300 p-1">VD</th>
                      </tr>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                        <th className="border border-slate-300 p-1" colSpan={3}></th>
                        <th className="border border-slate-300 p-1">Biết</th>
                        <th className="border border-slate-300 p-1">Hiểu</th>
                        <th className="border border-slate-300 p-1">VD</th>
                        <th className="border border-slate-300 p-1">Biết</th>
                        <th className="border border-slate-300 p-1">Hiểu</th>
                        <th className="border border-slate-300 p-1">VD</th>
                        <th className="border border-slate-300 p-1">Biết</th>
                        <th className="border border-slate-300 p-1">Hiểu</th>
                        <th className="border border-slate-300 p-1">VD</th>
                        <th className="border border-slate-300 p-1" colSpan={4}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {examData.level === "THPT" ? (
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>1</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Listening</td>
                            <td className="border border-slate-300 p-2 text-left">1. Nghe và chọn câu trả lời đúng (4 câu hỏi)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold"></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>20%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Nghe và chọn câu trả lời True/False (4 câu hỏi)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold text-left">Language</td>
                            <td className="border border-slate-300 p-2 text-left">Chọn từ/cụm từ đúng để điền vào chỗ trống trong 2 thông báo/quảng cáo/... (mỗi văn bản có 6 câu hỏi)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">7</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">3</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">7</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">3</td>
                            <td className="border border-slate-300 p-2 font-bold">30%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>3</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Reading</td>
                            <td className="border border-slate-300 p-2 text-left">1. Đọc đoạn văn về chủ đề đã học và chọn câu/cụm từ/mệnh đề đúng để điền vào chỗ trống (5 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">1</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">2</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>30%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Đọc bài đọc về chủ đề đã học và chọn câu trả lời đúng (7 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">3</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">2</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">3</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>4</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Writing</td>
                            <td className="border border-slate-300 p-2 text-left">1. Sắp xếp các câu thành 1 đoạn hội thoại/đoạn văn/lá thư/email/tin nhắn... (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">1</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">1</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>20%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">3. Viết theo chủ đề (120-150 từ)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold text-purple-800">1 bài</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold text-purple-800">1 bài</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tổng số câu</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">14</td>
                            <td className="border border-slate-300 p-2 text-amber-800">10</td>
                            <td className="border border-slate-300 p-2 text-purple-800">8</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 text-purple-800">1 bài</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">16</td>
                            <td className="border border-slate-300 p-2 text-amber-800">12</td>
                            <td className="border border-slate-300 p-2 text-purple-800">12 + 1 bài</td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tổng số điểm</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">3,5</td>
                            <td className="border border-slate-300 p-2 text-amber-800">2,5</td>
                            <td className="border border-slate-300 p-2 text-purple-800">2,0</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">0,5</td>
                            <td className="border border-slate-300 p-2 text-amber-800">0,5</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 text-purple-800">1,0</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">
                              {((examData.ratio?.nb ?? ratio.nb) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-amber-800">
                              {((examData.ratio?.th ?? ratio.th) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-purple-800">
                              {((examData.ratio?.vd ?? ratio.vd) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-blue-700">10,0</td>
                          </tr>
                          <tr className="bg-blue-50 font-bold text-blue-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tỉ lệ (%)</td>
                            <td colSpan={9} className="border border-slate-300 p-2 text-center"></td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.nb ?? ratio.nb}%</td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.th ?? ratio.th}%</td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.vd ?? ratio.vd}%</td>
                            <td className="border border-slate-300 p-2">100%</td>
                          </tr>
                        </>
                      ) : examData.level === "Tiểu học" ? (
                        // TIỂU HỌC matrix rows
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>1</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Listening</td>
                            <td className="border border-slate-300 p-2 text-left">1. Nghe và đánh dấu Đúng - Sai (True/False) (4 câu)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>25%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Nghe và chọn câu trả lời đúng A, B, C (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>2</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Language</td>
                            <td className="border border-slate-300 p-2 text-left">1. Ngữ âm & Âm chữ cái (Phonics) (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">4</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">4</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>25%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Từ vựng & Mẫu câu (Odd one out, điền câu đơn) (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>3</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Reading</td>
                            <td className="border border-slate-300 p-2 text-left">1. Đọc câu nhìn tranh / Đúng - Sai (4 câu)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>25%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Đọc hiểu đoạn văn 40-60 từ trả lời A, B, C (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">1</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">1</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>4</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Writing</td>
                            <td className="border border-slate-300 p-2 text-left">1. Sắp xếp chữ cái tạo thành từ đúng (4 câu)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={1}></td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 font-bold">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>25%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Sắp xếp từ thành câu đơn hoàn chỉnh (4 câu)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">4</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold">4</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tổng số câu</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">11</td>
                            <td className="border border-slate-300 p-2 text-amber-800">6</td>
                            <td className="border border-slate-300 p-2 text-purple-800">1</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">4</td>
                            <td className="border border-slate-300 p-2 text-amber-800">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-amber-800">4</td>
                            <td className="border border-slate-300 p-2 text-purple-800">4</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">15</td>
                            <td className="border border-slate-300 p-2 text-amber-800">14</td>
                            <td className="border border-slate-300 p-2 text-purple-800">5</td>
                            <td className="border border-slate-300 p-2 text-blue-700">32 câu</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tổng số điểm</td>
                            <td colSpan={9} className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-emerald-800">
                              {((examData.ratio?.nb ?? ratio.nb) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-amber-800">
                              {((examData.ratio?.th ?? ratio.th) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-purple-800">
                              {((examData.ratio?.vd ?? ratio.vd) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-blue-700">10,0</td>
                          </tr>
                          <tr className="bg-blue-50 font-bold text-blue-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tỉ lệ (%)</td>
                            <td colSpan={9} className="border border-slate-300 p-2 text-center"></td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.nb ?? ratio.nb}%</td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.th ?? ratio.th}%</td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.vd ?? ratio.vd}%</td>
                            <td className="border border-slate-300 p-2">100%</td>
                          </tr>
                        </>
                      ) : (
                        // THCS matrix rows
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>1</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Listening</td>
                            <td className="border border-slate-300 p-2 text-left">1. Nghe và chọn True/False (4 câu)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>20%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Nghe và chọn đáp án đúng A, B, C, D (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>2</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Language</td>
                            <td className="border border-slate-300 p-2 text-left">1. Phát âm và Trọng âm (4 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">4</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">4</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>25%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Từ vựng & Ngữ pháp (6 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">3</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">1</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">3</td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>3</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Reading</td>
                            <td className="border border-slate-300 p-2 text-left">1. Đọc điền từ Cloze (80-100 từ, 5 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">1</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>25%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Đọc hiểu đoạn văn (80-100 từ, 5 câu)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">1</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">1</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>4</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Writing</td>
                            <td className="border border-slate-300 p-2 text-left">1. Tìm lỗi sai & Viết lại câu (4 câu - không có NB theo CV 7991)</td>
                            <td className="border border-slate-300 p-2 font-semibold text-emerald-800"></td>
                            <td className="border border-slate-300 p-2 font-semibold text-amber-800">2</td>
                            <td className="border border-slate-300 p-2 font-semibold text-purple-800">2</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold" rowSpan={2}>20%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Viết đoạn văn ngắn (60-80 từ)</td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={3}></td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold text-purple-800">1 bài</td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 font-bold text-purple-800">1 bài</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tổng số câu</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">12</td>
                            <td className="border border-slate-300 p-2 text-amber-800">9</td>
                            <td className="border border-slate-300 p-2 text-purple-800">5</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">2</td>
                            <td className="border border-slate-300 p-2 text-amber-800">2</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2" colSpan={2}></td>
                            <td className="border border-slate-300 p-2 text-purple-800">1 bài</td>
                            <td className="border border-slate-300 p-2 text-emerald-800">14</td>
                            <td className="border border-slate-300 p-2 text-amber-800">11</td>
                            <td className="border border-slate-300 p-2 text-purple-800">9 + 1 bài</td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tổng số điểm</td>
                            <td colSpan={9} className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-emerald-800">
                              {((examData.ratio?.nb ?? ratio.nb) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-amber-800">
                              {((examData.ratio?.th ?? ratio.th) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-purple-800">
                              {((examData.ratio?.vd ?? ratio.vd) * 0.1).toFixed(1).replace('.', ',')}
                            </td>
                            <td className="border border-slate-300 p-2 text-blue-700">10,0</td>
                          </tr>
                          <tr className="bg-blue-50 font-bold text-blue-900">
                            <td colSpan={3} className="border border-slate-300 p-2 text-center">Tỉ lệ (%)</td>
                            <td colSpan={9} className="border border-slate-300 p-2 text-center"></td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.nb ?? ratio.nb}%</td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.th ?? ratio.th}%</td>
                            <td className="border border-slate-300 p-2">{examData.ratio?.vd ?? ratio.vd}%</td>
                            <td className="border border-slate-300 p-2">100%</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 font-sans border-t border-slate-100">
                  <div className="font-bold text-slate-800">CHÚ Ý (Theo hướng dẫn của Bộ GD&ĐT):</div>
                  <div>1. Bài kiểm tra kết hợp Tự luận, Trắc nghiệm khách quan 04 lựa chọn, chỉ có 01 câu trả lời đúng và Trắc nghiệm khách quan Đúng - Sai.</div>
                  <div>2. Bài Nghe True/False có thể được thay bằng bài Nghe điền từ vào chỗ trống.</div>
                  <div>
                    3. Tỷ lệ phân bổ mức độ nhận thức: {examData.ratio?.nb ?? ratio.nb}% Nhận biết (
                    {((examData.ratio?.nb ?? ratio.nb) * 0.1).toFixed(1)}đ) – {examData.ratio?.th ?? ratio.th}% Thông hiểu (
                    {((examData.ratio?.th ?? ratio.th) * 0.1).toFixed(1)}đ) – {examData.ratio?.vd ?? ratio.vd}% Vận dụng (
                    {((examData.ratio?.vd ?? ratio.vd) * 0.1).toFixed(1)}đ).
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BẢN ĐẶC TẢ ĐỀ (PHỤ LỤC 2 CV 7991) */}
            {activeTab === 'spec' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-slate-200 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-xs font-bold text-slate-700">BỘ GIÁO DỤC VÀ ĐÀO TẠO</div>
                  <div className="text-xs font-semibold text-slate-500">PHỤ LỤC (Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)</div>
                  <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ KHỐI {examData.grade} ({examData.level})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                        <th className="border border-slate-300 p-2 w-8" rowSpan={2}>(1) TT</th>
                        <th className="border border-slate-300 p-2 text-left w-24" rowSpan={2}>(2) Kĩ năng</th>
                        <th className="border border-slate-300 p-2 text-left w-36" rowSpan={2}>(3) Nội dung/dạng bài</th>
                        <th className="border border-slate-300 p-2 text-left" rowSpan={2}>(4) Yêu cầu cần đạt (Đã được tách ra theo các mức độ)</th>
                        <th className="border border-slate-300 p-1 bg-blue-50 text-blue-900" colSpan={4}>Số lượng câu hỏi ở các mức độ</th>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-700 text-center">
                        <th className="border border-slate-300 p-1 w-16">(5) Nhiều lựa chọn</th>
                        <th className="border border-slate-300 p-1 w-14">(6) Đúng - Sai</th>
                        <th className="border border-slate-300 p-1 w-14">(7) Trả lời ngắn</th>
                        <th className="border border-slate-300 p-1 w-14">(8) Tự luận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examData.level === "THPT" ? (
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>1</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Listening</td>
                            <td className="border border-slate-300 p-2 text-left">1. Nghe và chọn câu trả lời đúng (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nghe và nhận ra thông tin chi tiết về một trong các chủ đề đã học (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Hiểu nội dung chính của đoạn độc thoại/hội thoại để tìm câu trả lời đúng (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Nghe và chọn True/False (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nghe và nhận ra thông tin chi tiết về chủ đề đã học (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Nghe hiểu để xác định thông tin đúng/sai về chủ đề đã học (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold">2</td>
                            <td className="border border-slate-300 p-2 font-bold text-left">Language</td>
                            <td className="border border-slate-300 p-2 text-left">Chọn từ/cụm từ đúng để điền vào chỗ trống trong 2 thông báo/quảng cáo/... (mỗi văn bản có 6 câu hỏi)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Thời của động từ (QKĐ/HTHT) (1 câu); Đại từ quan hệ (1 câu); Trật tự từ (1 câu); Ving (1 câu); Động từ khuyết thiếu (1 câu); Từ loại (1 câu); Giới từ (1 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Liên từ (1 câu); Từ hạn định/lượng từ (1 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Từ vựng theo ngữ cảnh (2 câu); Liên kết từ (Collocation) (1 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">12</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>3</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Reading</td>
                            <td className="border border-slate-300 p-2 text-left">1. Đọc đoạn văn khoảng 230 từ về chủ đề đã học và chọn câu/cụm từ/mệnh đề đúng để điền vào chỗ trống (5 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Điền từ quy chiếu (1 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Điền câu (1 câu); Điền cụm từ (1 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Điền mệnh đề (2 câu: 1 MĐ thời gian, 1 MĐ lí do/nhượng bộ)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">5</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Đọc bài đọc khoảng 250-280 từ về chủ đề đã học và chọn câu trả lời đúng (7 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Câu hỏi về thông tin chi tiết (1 câu); Câu hỏi từ quy chiếu (1 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Từ đồng nghĩa/trái nghĩa (1 câu); Câu hỏi thông tin theo đoạn (1 câu); Câu hỏi ý chính (1 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Câu hỏi paraphrasing (1 câu); Câu hỏi TRUE/NOT TRUE (1 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">7</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>4</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Writing</td>
                            <td className="border border-slate-300 p-2 text-left">1. Sắp xếp các câu thành 1 đoạn hội thoại/đoạn văn/lá thư/email/tin nhắn... (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Biết trật tự logic của đoạn hội thoại 40-60 từ (2 câu); Trật tự logic của đoạn văn/lá thư 80-100 từ (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Hiểu được trật tự logic của đoạn văn/lá thư, tin nhắn</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Vận dụng hiểu biết về ngôn ngữ và logic của đoạn văn/lá thư/tin nhắn</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Viết theo chủ đề (120-150 từ)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Viết bài văn/bài báo 120-150 từ về chủ đề đã học (1 bài viết)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">1</td>
                          </tr>
                        </>
                      ) : examData.level === "Tiểu học" ? (
                        // TIỂU HỌC Spec
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>1</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Listening</td>
                            <td className="border border-slate-300 p-2 text-left">1. Nghe và đánh dấu Đúng - Sai (True/False) (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nghe nhận biết tên, tuổi, quốc gia, thời gian trong các câu đơn ngắn (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Nghe hiểu xác định thông tin đúng/sai về sở thích, hoạt động (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Nghe và chọn câu trả lời đúng A, B, C (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nghe lấy thông tin thời gian biểu, bữa ăn, môn học (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Nghe hiểu lý do và hoạt động ngoài trời của nhân vật (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>2</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Language</td>
                            <td className="border border-slate-300 p-2 text-left">1. Ngữ âm & Âm chữ cái (Phonics) (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nhận biết âm chữ cái và tổ hợp phụ âm đầu (/fr/, /tr/, /cl/...) (4 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Từ vựng & Mẫu câu (Odd one out, điền câu đơn) (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nhận biết từ vựng theo tranh, mẫu câu hỏi xuất xứ/khả năng (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Phân biệt từ khác loại (Odd one out) và liên từ trong câu đơn (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>3</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Reading</td>
                            <td className="border border-slate-300 p-2 text-left">1. Đọc câu nhìn tranh / Đúng - Sai (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Đọc câu đơn và nhận biết tranh minh họa phù hợp (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Xác định câu miêu tả đúng hoặc sai so với ngữ cảnh (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Đọc hiểu đoạn văn 40-60 từ trả lời A, B, C (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Tìm thông tin chi tiết về trường lớp, thời gian biểu (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Hiểu lý do yêu thích môn học và hoạt động trong đoạn văn (1 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Hiểu ý chính và suy luận thông tin mở rộng (1 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>4</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Writing</td>
                            <td className="border border-slate-300 p-2 text-left">1. Sắp xếp chữ cái tạo thành từ đúng chính tả (4 câu - KHÔNG có Nhận biết)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-amber-800">- Hiểu:</strong> Sắp xếp lại các chữ cái rời rạc thành từ có nghĩa theo chủ đề (4 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Sắp xếp từ thành câu đơn hoàn chỉnh (4 câu - KHÔNG có Nhận biết)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Sắp xếp từ ngữ thành câu đơn hoàn chỉnh đúng trật tự ngữ pháp, viết hoa và dấu câu (4 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                          </tr>
                        </>
                      ) : (
                        // THCS Spec
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>1</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Listening</td>
                            <td className="border border-slate-300 p-2 text-left">1. Nghe và chọn True/False (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nhận ra thông tin chi tiết cụ thể trong đoạn nghe 80-100 từ (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Xác định đúng/sai về ý kiến nhân vật (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Nghe và chọn đáp án đúng A, B, C, D (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Nghe lấy thông tin địa điểm, thời gian (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Hiểu nội dung chính của hội thoại (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>2</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Language</td>
                            <td className="border border-slate-300 p-2 text-left">1. Phát âm và Trọng âm (4 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Phát âm nguyên âm/phụ âm (2 câu); Trọng âm từ 2 âm tiết (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Từ vựng & Ngữ pháp (6 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Từ vựng chủ đề bài học; Các thì cơ bản (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Cụm động từ, câu so sánh (3 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Sử dụng liên từ trong câu phức (1 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">6</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>3</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Reading</td>
                            <td className="border border-slate-300 p-2 text-left">1. Đọc điền từ Cloze test (80-100 từ, 5 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Điền từ loại cơ bản (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Điền từ nối/đại từ quan hệ (2 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Điền từ vựng ngữ cảnh (1 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">5</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Đọc hiểu đoạn văn (80-100 từ, 5 câu)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-emerald-800">- Biết:</strong> Tìm thông tin hiển ngôn chi tiết (2 câu)</div>
                              <div><strong className="text-amber-800">- Hiểu:</strong> Xác định từ đồng nghĩa và ý chính (2 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Suy luận thái độ/cảm xúc (1 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">5</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold" rowSpan={2}>4</td>
                            <td className="border border-slate-300 p-2 font-bold text-left" rowSpan={2}>Writing</td>
                            <td className="border border-slate-300 p-2 text-left">1. Tìm lỗi sai & Viết lại câu (4 câu - KHÔNG có Nhận biết)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-amber-800">- Hiểu:</strong> Phát hiện lỗi ngữ pháp cơ bản (2 câu)</div>
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Viết lại câu giữ nguyên nghĩa và sắp xếp từ (2 câu)</div>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">4</td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-left">2. Viết đoạn văn ngắn (60-80 từ)</td>
                            <td className="border border-slate-300 p-2 space-y-1 text-slate-800">
                              <div><strong className="text-purple-800">- Vận dụng:</strong> Viết đoạn văn ngắn theo chủ đề có gợi ý (1 bài viết)</div>
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">1</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT */}
            {activeTab === 'solution' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-slate-200 space-y-8">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                    Đáp Án & Hướng Dẫn Giải Chi Tiết Từng Câu
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cung cấp phân tích chi tiết, dẫn chứng trích xuất từ văn bản, điểm ngữ pháp trọng tâm và thang điểm bài viết.
                  </p>
                </div>

                {/* Danh sách lời giải chi tiết */}
                <div className="space-y-6">
                  {/* Listening */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60">
                      Phần A: Listening (Giải thích chi tiết)
                    </h4>
                    <div className="space-y-3 pl-2">
                      {[...examData.listening.part1.questions, ...examData.listening.part2.questions].map((q) => (
                        <div key={q.id} className="text-xs border-b border-slate-100 pb-2.5">
                          <div className="font-bold text-slate-900">
                            Câu {q.id} • Đáp án: <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{q.answer}</span> ({q.level})
                          </div>
                          <div className="text-slate-700 mt-1">{q.explanation}</div>
                          {q.evidence && (
                            <div className="text-slate-500 italic mt-0.5 pl-2 border-l-2 border-blue-400">
                              Dẫn chứng: "{q.evidence}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60">
                      Phần B: Language (Giải thích chi tiết)
                    </h4>
                    <div className="space-y-3 pl-2">
                      {(examData.language.isModernFormat
                        ? [...(examData.language.text1?.questions || []), ...(examData.language.text2?.questions || [])]
                        : [...(examData.language.phonetics || []), ...(examData.language.grammarVocab || [])]
                      ).map((q) => (
                        <div key={q.id} className="text-xs border-b border-slate-100 pb-2.5">
                          <div className="font-bold text-slate-900">
                            Câu {q.id} • Đáp án: <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{q.answer}</span> ({q.level})
                          </div>
                          <div className="text-slate-700 mt-1">{q.explanation}</div>
                          {q.knowledgePoint && (
                            <div className="text-indigo-700 font-medium mt-0.5">
                              Kiến thức trọng tâm: {q.knowledgePoint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reading */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60">
                      Phần C: Reading (Giải thích chi tiết)
                    </h4>
                    <div className="space-y-3 pl-2">
                      {[...examData.reading.part1.questions, ...examData.reading.part2.questions].map((q) => (
                        <div key={q.id} className="text-xs border-b border-slate-100 pb-2.5">
                          <div className="font-bold text-slate-900">
                            Câu {q.id} • Đáp án: <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{q.answer}</span> ({q.level})
                          </div>
                          <div className="text-slate-700 mt-1">{q.explanation}</div>
                          {q.evidence && (
                            <div className="text-slate-500 italic mt-0.5 pl-2 border-l-2 border-blue-400">
                              Dẫn chứng: "{q.evidence}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Writing */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60">
                      Phần D: Writing (Hướng dẫn giải & Thang điểm)
                    </h4>
                    <div className="space-y-3 pl-2">
                      {examData.writing.part1.map((q) => (
                        <div key={q.id} className="text-xs border-b border-slate-100 pb-2.5">
                          <div className="font-bold text-slate-900">
                            Câu {q.id} • Đáp án: <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{q.answer}</span> ({q.level})
                          </div>
                          <div className="text-slate-700 mt-1">{q.explanation}</div>
                        </div>
                      ))}

                      {/* Rubric bài viết luận */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                        <div className="font-bold text-xs text-slate-900 uppercase">
                          Tiêu chí chấm bài viết tự luận (Writing Rubrics - 1.0 điểm):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {examData.writing.part2.rubrics?.map((r, i) => (
                            <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200">
                              <div className="font-bold text-blue-800">{r.criterion}: {r.point} điểm</div>
                              <div className="text-slate-600 mt-1">{r.desc}</div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <div className="font-bold text-xs text-slate-800 mb-1">Bài mẫu tham khảo (Sample):</div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                            {examData.writing.part2.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Scripts */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      Kịch Bản Bài Nghe (Listening Transcripts)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-800 mb-1.5">Part 1 Script:</div>
                        <div className="text-slate-700 whitespace-pre-line leading-relaxed italic font-serif">
                          {examData.listening.part1.script}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-800 mb-1.5">Part 2 Script:</div>
                        <div className="text-slate-700 whitespace-pre-line leading-relaxed italic font-serif">
                          {examData.listening.part2.script}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: ĐÁNH GIÁ KỸ NĂNG NÓI (SPEAKING TEST) */}
            {activeTab === 'speaking' && examData.speaking && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-slate-200 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-indigo-600" />
                    Hướng Dẫn Tổ Chức & Thang Điểm Đánh Giá Kỹ Năng Nói (2.0 điểm)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Quy chuẩn theo CV 7991: Bài thi Nói cuối kỳ chiếm 20% tổng điểm (thang 2.0). Được lồng ghép trong các tiết ôn tập hoặc tổ chức thi riêng.
                  </p>
                </div>

                {/* Phần 1: Giới thiệu bản thân */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-sm text-slate-900">
                    Phần 1: Giới thiệu bản thân (Introduce Yourself) – 0,5 điểm
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                    {examData.speaking.part1.criteria.map((c, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-slate-200">
                        <div className="font-bold text-blue-700">{c.point} điểm</div>
                        <div className="text-slate-600 mt-1">{c.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phần 2: Thuyết trình theo chủ đề */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-sm text-slate-900">
                    Phần 2: Thuyết trình theo chủ đề bốc thăm (Topic Presentation) – 1,5 điểm
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {examData.speaking.part2.rubrics.map((r, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <div className="font-bold text-indigo-700">{r.point} điểm</div>
                        <div className="text-slate-700 font-medium mt-0.5">{r.criterion}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <div className="font-bold text-xs text-slate-800 mb-2">Danh sách phiếu bốc thăm chủ đề (Topic Cards):</div>
                    <div className="space-y-1.5">
                      {examData.speaking.part2.topics.map((t, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded flex items-center justify-center font-bold text-[11px] shrink-0">
                            {idx + 1}
                          </span>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
              </>
            )}

          </div>

        </div>

      </main>

      {/* Modal Xem & Chỉnh sửa Phụ lục 3 */}
      {showPl3Modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    Phụ lục 3: Kế hoạch dạy học môn Tiếng Anh
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Lớp {grade} ({level})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nội dung làm căn cứ ra đề, xây dựng ma trận và bản đặc tả theo CV 7991
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPl3Modal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  Bạn có thể xem hoặc chỉnh sửa trực tiếp nội dung Phụ lục 3 bên dưới:
                </span>
                {pl3FileName && (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Từ file: {pl3FileName}
                  </span>
                )}
              </div>

              <textarea
                value={pl3Content}
                onChange={(e) => setPl3Content(e.target.value)}
                rows={14}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-y"
                placeholder="Nhập hoặc dán nội dung kế hoạch dạy học / phân phối chương trình môn Tiếng Anh..."
              />

              <div className="text-[11px] text-slate-500 italic">
                * Mẹo: Khi tải lên file Word (.docx) ở màn hình chính, toàn bộ nội dung kế hoạch dạy học sẽ được nạp vào đây làm căn cứ tạo đề.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setPl3FileName(null);
                  setPl3Content(getDefaultPl3Content(grade, examPeriod));
                  showToast(`Đã khôi phục Phụ lục 3 chuẩn SGK GDPT 2018 cho Lớp ${grade}!`, "info");
                }}
                className="text-xs text-slate-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Khôi phục chuẩn SGK GDPT 2018
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPl3Modal(false);
                    showToast("Đã cập nhật căn cứ Phụ lục 3 thành công!", "success");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu & Áp Dụng Căn Cứ Ra Đề
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md p-3.5 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-red-50/95 border-red-300 text-red-900'
              : 'bg-blue-50/95 border-blue-300 text-blue-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <X className="w-5 h-5 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
          <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
