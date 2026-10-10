/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  PageBreak
} from 'docx';
import { triggerBrowserDownload } from './fileDownload';
import { OfficialExamData, ExamQuestion } from '../data/officialExemplars';

// Đường viền chuẩn đơn cho bảng
const standardBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "000000"
};

const tableBorders = {
  top: standardBorder,
  bottom: standardBorder,
  left: standardBorder,
  right: standardBorder,
  insideHorizontal: standardBorder,
  insideVertical: standardBorder
};

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: "auto"
};

const invisibleBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
  insideHorizontal: noBorder,
  insideVertical: noBorder
};

// Helper tạo Cell có viền
const createCell = (text: string, options: any = {}) => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20, font: "Times New Roman" })],
        alignment: options.alignment || AlignmentType.CENTER,
        spacing: { before: 20, after: 20 }
      })
    ],
    verticalAlign: VerticalAlign.CENTER,
    ...options
  });
};

const createBoldCell = (text: string, options: any = {}) => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, font: "Times New Roman" })],
        alignment: options.alignment || AlignmentType.CENTER,
        spacing: { before: 20, after: 20 }
      })
    ],
    verticalAlign: VerticalAlign.CENTER,
    ...options
  });
};

// =========================================================================
// 1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ THEO ĐÚNG MẪU PHỤ LỤC 1 CÔNG VĂN 7991
// =========================================================================
export const buildMatrixTableCV7991 = (examData: OfficialExamData) => {
  const isTHPT = examData.level === "THPT";

  // Rows chuẩn theo mẫu Phụ lục 1 CV 7991 (Tổng 16 cột khớp tuyệt đối không lệch ô)
  const rows: TableRow[] = [
    // Header Row 1 (rowSpan: 3 cho các cột độc lập)
    new TableRow({
      children: [
        createBoldCell("TT", { rowSpan: 3, width: { size: 4, type: WidthType.PERCENTAGE } }),
        createBoldCell("Kiến thức, Kỹ năng", { rowSpan: 3, width: { size: 14, type: WidthType.PERCENTAGE } }),
        createBoldCell("Nội dung/đơn vị kiến thức/dạng bài", { rowSpan: 3, width: { size: 28, type: WidthType.PERCENTAGE } }),
        createBoldCell("Mức độ đánh giá", { columnSpan: 9, width: { size: 36, type: WidthType.PERCENTAGE } }),
        createBoldCell("Tổng số câu", { columnSpan: 3, width: { size: 12, type: WidthType.PERCENTAGE } }),
        createBoldCell("Tỉ lệ % điểm", { rowSpan: 3, width: { size: 6, type: WidthType.PERCENTAGE } }),
      ]
    }),
    // Header Row 2 (Chia dạng thức câu hỏi)
    new TableRow({
      children: [
        createBoldCell("TNKQ nhiều lựa chọn", { columnSpan: 3 }),
        createBoldCell("TNKQ Đúng - Sai", { columnSpan: 3 }),
        createBoldCell("Tự luận", { columnSpan: 3 }),
        createBoldCell("Tổng", { columnSpan: 3 }),
      ]
    }),
    // Header Row 3 (3 mức độ nhận thức CV 7991: Biết - Hiểu - Vận dụng, đúng 12 cột)
    new TableRow({
      children: [
        // Dưới TNKQ nhiều lựa chọn
        createBoldCell("Biết"), createBoldCell("Hiểu"), createBoldCell("VD"),
        // Dưới TNKQ Đúng - Sai
        createBoldCell("Biết"), createBoldCell("Hiểu"), createBoldCell("VD"),
        // Dưới Tự luận
        createBoldCell("Biết"), createBoldCell("Hiểu"), createBoldCell("VD"),
        // Dưới Tổng
        createBoldCell("Biết"), createBoldCell("Hiểu"), createBoldCell("VD"),
      ]
    })
  ];

  if (isTHPT) {
    // 1. Listening (THPT)
    rows.push(
      new TableRow({
        children: [
          createBoldCell("1", { rowSpan: 2 }),
          createBoldCell("Listening", { rowSpan: 2 }),
          createCell("1. Nghe và chọn câu trả lời đúng (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("2"), createCell(""), // MCQ
          createCell(""), createCell(""), createCell(""), // TF
          createCell(""), createCell(""), createCell(""), // Essay
          createCell("2"), createCell("2"), createCell(""), // Tổng
          createBoldCell("20%", { rowSpan: 2 }) // Tỉ lệ
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Nghe và chọn câu trả lời True/False (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""), // MCQ
          createCell("2"), createCell("2"), createCell(""), // TF
          createCell(""), createCell(""), createCell(""), // Essay
          createCell("2"), createCell("2"), createCell(""), // Tổng
        ]
      }),

      // 2. Language (THPT)
      new TableRow({
        children: [
          createBoldCell("2"),
          createBoldCell("Language"),
          createCell("Chọn từ/cụm từ đúng để điền vào chỗ trống trong 2 thông báo/quảng cáo/... (mỗi văn bản có 6 câu hỏi)", { alignment: AlignmentType.LEFT }),
          createCell("7"), createCell("2"), createCell("3"), // MCQ
          createCell(""), createCell(""), createCell(""), // TF
          createCell(""), createCell(""), createCell(""), // Essay
          createCell("7"), createCell("2"), createCell("3"), // Tổng
          createBoldCell("30%") // Tỉ lệ
        ]
      }),

      // 3. Reading (THPT)
      new TableRow({
        children: [
          createBoldCell("3", { rowSpan: 2 }),
          createBoldCell("Reading", { rowSpan: 2 }),
          createCell("1. Đọc đoạn văn về chủ đề đã học và chọn câu/cụm từ/mệnh đề đúng để điền vào chỗ trống (5 câu)", { alignment: AlignmentType.LEFT }),
          createCell("1"), createCell("2"), createCell("2"), // MCQ
          createCell(""), createCell(""), createCell(""), // TF
          createCell(""), createCell(""), createCell(""), // Essay
          createCell("1"), createCell("2"), createCell("2"), // Tổng
          createBoldCell("30%", { rowSpan: 2 }) // Tỉ lệ
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Đọc bài đọc về chủ đề đã học và chọn câu trả lời đúng (7 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("3"), createCell("2"), // MCQ
          createCell(""), createCell(""), createCell(""), // TF
          createCell(""), createCell(""), createCell(""), // Essay
          createCell("2"), createCell("3"), createCell("2"), // Tổng
        ]
      }),

      // 4. Writing (THPT)
      new TableRow({
        children: [
          createBoldCell("4", { rowSpan: 2 }),
          createBoldCell("Writing", { rowSpan: 2 }),
          createCell("1. Sắp xếp các câu thành 1 đoạn hội thoại/đoạn văn/lá thư/email/tin nhắn... (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("1"), createCell("1"), // MCQ
          createCell(""), createCell(""), createCell(""), // TF
          createCell(""), createCell(""), createCell(""), // Essay
          createCell("2"), createCell("1"), createCell("1"), // Tổng
          createBoldCell("20%", { rowSpan: 2 }) // Tỉ lệ
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Viết theo chủ đề (120-150 từ)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""), // MCQ
          createCell(""), createCell(""), createCell(""), // TF
          createCell(""), createCell(""), createCell("1 bài"), // Essay
          createCell(""), createCell(""), createCell("1 bài"), // Tổng
        ]
      }),

      // Tổng số câu
      new TableRow({
        children: [
          createBoldCell("Tổng số câu", { columnSpan: 3 }),
          createBoldCell("14"), createBoldCell("10"), createBoldCell("8"),
          createBoldCell("2"), createBoldCell("2"), createCell(""),
          createCell(""), createCell(""), createBoldCell("1 bài"),
          createBoldCell("16"), createBoldCell("12"), createBoldCell("12 + 1 bài"),
          createBoldCell("")
        ]
      }),

      // Tổng số điểm
      new TableRow({
        children: [
          createBoldCell("Tổng số điểm", { columnSpan: 3 }),
          createCell("3,5"), createCell("2,5"), createCell("2,0"),
          createCell("0,5"), createCell("0,5"), createCell(""),
          createCell(""), createCell(""), createCell("1,0"),
          createBoldCell(`${((examData.ratio?.nb ?? 40) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell(`${((examData.ratio?.th ?? 30) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell(`${((examData.ratio?.vd ?? 30) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell("10,0")
        ]
      }),

      // Tỉ lệ %
      new TableRow({
        children: [
          createBoldCell("Tỉ lệ (%)", { columnSpan: 3 }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createBoldCell(`${examData.ratio?.nb ?? 40}%`),
          createBoldCell(`${examData.ratio?.th ?? 30}%`),
          createBoldCell(`${examData.ratio?.vd ?? 30}%`),
          createBoldCell("100%")
        ]
      })
    );
  } else if (examData.level === "Tiểu học") {
    // TIỂU HỌC Matrix
    rows.push(
      new TableRow({
        children: [
          createBoldCell("1", { rowSpan: 2 }),
          createBoldCell("Listening", { rowSpan: 2 }),
          createCell("1. Nghe và đánh dấu Đúng - Sai (True/False) (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
          createBoldCell("25%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Nghe và chọn câu trả lời đúng A, B, C (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("2"), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("2", { rowSpan: 2 }),
          createBoldCell("Language", { rowSpan: 2 }),
          createCell("1. Ngữ âm & Âm chữ cái (Phonics) (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell("4"), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("4"), createCell(""), createCell(""),
          createBoldCell("25%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Từ vựng & Mẫu câu (Odd one out, điền câu đơn) (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("2"), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("3", { rowSpan: 2 }),
          createBoldCell("Reading", { rowSpan: 2 }),
          createCell("1. Đọc câu nhìn tranh / Đúng - Sai (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
          createBoldCell("25%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Đọc hiểu đoạn văn 40-60 từ trả lời A, B, C (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell("1"), createCell("2"), createCell("1"),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("1"), createCell("2"), createCell("1"),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("4", { rowSpan: 2 }),
          createBoldCell("Writing", { rowSpan: 2 }),
          createCell("1. Sắp xếp chữ cái tạo thành từ đúng (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell("4"), createCell(""),
          createCell(""), createCell("4"), createCell(""),
          createBoldCell("25%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Sắp xếp từ thành câu đơn hoàn chỉnh (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell("4"),
          createCell(""), createCell(""), createCell("4"),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("Tổng số câu", { columnSpan: 3 }),
          createBoldCell("11"), createBoldCell("6"), createBoldCell("1"),
          createBoldCell("4"), createBoldCell("4"), createCell(""),
          createCell(""), createBoldCell("4"), createBoldCell("4"),
          createBoldCell("15"), createBoldCell("14"), createBoldCell("5"),
          createBoldCell("32 câu")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("Tổng số điểm", { columnSpan: 3 }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createBoldCell(`${((examData.ratio?.nb ?? 40) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell(`${((examData.ratio?.th ?? 30) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell(`${((examData.ratio?.vd ?? 30) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell("10,0")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("Tỉ lệ (%)", { columnSpan: 3 }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createBoldCell(`${examData.ratio?.nb ?? 40}%`),
          createBoldCell(`${examData.ratio?.th ?? 30}%`),
          createBoldCell(`${examData.ratio?.vd ?? 30}%`),
          createBoldCell("100%")
        ]
      })
    );
  } else {
    // THCS
    rows.push(
      new TableRow({
        children: [
          createBoldCell("1", { rowSpan: 2 }),
          createBoldCell("Listening", { rowSpan: 2 }),
          createCell("1. Nghe và chọn True/False (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
          createBoldCell("20%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Nghe và chọn câu trả lời đúng (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("2"), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell(""),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("2", { rowSpan: 2 }),
          createBoldCell("Language", { rowSpan: 2 }),
          createCell("1. Phát âm & Trọng âm (4 câu)", { alignment: AlignmentType.LEFT }),
          createCell("4"), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("4"), createCell(""), createCell(""),
          createBoldCell("25%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Từ vựng & Ngữ pháp (6 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("3"), createCell("1"),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("3"), createCell("1"),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("3", { rowSpan: 2 }),
          createBoldCell("Reading", { rowSpan: 2 }),
          createCell("1. Đọc điền từ Cloze test (80-100 từ, 5 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("2"), createCell("1"),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell("1"),
          createBoldCell("25%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Đọc hiểu đoạn văn (80-100 từ, 5 câu)", { alignment: AlignmentType.LEFT }),
          createCell("2"), createCell("2"), createCell("1"),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell("2"), createCell("2"), createCell("1"),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("4", { rowSpan: 2 }),
          createBoldCell("Writing", { rowSpan: 2 }),
          createCell("1. Tìm lỗi sai & Viết lại câu (4 câu - không có NB theo CV 7991)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell("2"), createCell("2"),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell("2"), createCell("2"),
          createBoldCell("20%", { rowSpan: 2 })
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Viết đoạn văn ngắn (60-80 từ)", { alignment: AlignmentType.LEFT }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell("1 bài"),
          createCell(""), createCell(""), createCell("1 bài"),
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("Tổng số câu", { columnSpan: 3 }),
          createBoldCell("12"), createBoldCell("9"), createBoldCell("5"),
          createBoldCell("2"), createBoldCell("2"), createCell(""),
          createCell(""), createCell(""), createBoldCell("1 bài"),
          createBoldCell("14"), createBoldCell("11"), createBoldCell("9 + 1 bài"),
          createBoldCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("Tổng số điểm", { columnSpan: 3 }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createBoldCell(`${((examData.ratio?.nb ?? 40) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell(`${((examData.ratio?.th ?? 30) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell(`${((examData.ratio?.vd ?? 30) * 0.1).toFixed(1).replace('.', ',')}`),
          createBoldCell("10,0")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("Tỉ lệ (%)", { columnSpan: 3 }),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createCell(""), createCell(""), createCell(""),
          createBoldCell(`${examData.ratio?.nb ?? 40}%`),
          createBoldCell(`${examData.ratio?.th ?? 30}%`),
          createBoldCell(`${examData.ratio?.vd ?? 30}%`),
          createBoldCell("100%")
        ]
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows
  });
};

// =========================================================================
// 2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ THEO ĐÚNG MẪU PHỤ LỤC 2 CÔNG VĂN 7991
// =========================================================================
export const buildSpecTableCV7991 = (examData: OfficialExamData) => {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        createBoldCell("(1) TT", { rowSpan: 2, width: { size: 4, type: WidthType.PERCENTAGE } }),
        createBoldCell("(2) Kiến thức, Kỹ năng", { rowSpan: 2, width: { size: 14, type: WidthType.PERCENTAGE } }),
        createBoldCell("(3) Nội dung/đơn vị kiến thức/dạng bài", { rowSpan: 2, width: { size: 24, type: WidthType.PERCENTAGE } }),
        createBoldCell("(4) Yêu cầu cần đạt\n(Đã được tách ra theo các mức độ)", { rowSpan: 2, width: { size: 36, type: WidthType.PERCENTAGE } }),
        createBoldCell("Số lượng câu hỏi ở các mức độ", { columnSpan: 4, width: { size: 22, type: WidthType.PERCENTAGE } }),
      ]
    }),
    new TableRow({
      children: [
        createBoldCell("(5) Nhiều lựa chọn"),
        createBoldCell("(6) Đúng - Sai"),
        createBoldCell("(7) Trả lời ngắn"),
        createBoldCell("(8) Tự luận"),
      ]
    })
  ];

  if (examData.level === "THPT") {
    // 1. Listening
    rows.push(
      new TableRow({
        children: [
          createBoldCell("1", { rowSpan: 2 }),
          createBoldCell("Listening", { rowSpan: 2 }),
          createCell("1. Nghe và chọn câu trả lời đúng (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nghe và nhận ra thông tin chi tiết về một trong các chủ đề đã học (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Hiểu nội dung chính của đoạn độc thoại/hội thoại để tìm câu trả lời đúng (2 câu)" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Nghe và chọn câu trả lời True/False (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nghe và nhận ra thông tin chi tiết về chủ đề đã học (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Nghe hiểu để xác định thông tin đúng/sai về chủ đề đã học (2 câu)" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createCell(""), createBoldCell("4"), createCell(""), createCell("")
        ]
      }),

      // 2. Language
      new TableRow({
        children: [
          createBoldCell("2"),
          createBoldCell("Language"),
          createCell("Chọn từ/cụm từ đúng để điền vào chỗ trống trong 2 thông báo/quảng cáo/... (mỗi văn bản dài khoảng 120 từ, có 6 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Thời của động từ (QKĐ/HTHT) (1 câu); Đại từ quan hệ (1 câu); Trật tự từ (1 câu); Ving (1 câu); Động từ khuyết thiếu (1 câu); Từ loại (1 câu); Giới từ (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Liên từ (1 câu); Từ hạn định/lượng từ (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Từ vựng theo ngữ cảnh (2 câu); Liên kết từ (Collocation) (1 câu)" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createBoldCell("12"), createCell(""), createCell(""), createCell("")
        ]
      }),

      // 3. Reading
      new TableRow({
        children: [
          createBoldCell("3", { rowSpan: 2 }),
          createBoldCell("Reading", { rowSpan: 2 }),
          createCell("1. Đọc đoạn văn khoảng 230 từ về chủ đề đã học và chọn câu/cụm từ/mệnh đề đúng để điền vào chỗ trống (5 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Điền từ quy chiếu (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Điền câu (1 câu); Điền cụm từ (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Điền mệnh đề (2 câu: 1 MĐ thời gian, 1 MĐ lý do/nhượng bộ)" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createBoldCell("5"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Đọc bài đọc khoảng 250-280 từ về chủ đề đã học và chọn câu trả lời đúng (7 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Câu hỏi về thông tin chi tiết (1 câu); Câu hỏi từ quy chiếu (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Từ đồng nghĩa hoặc trái nghĩa (1 câu); Câu hỏi thông tin theo đoạn (1 câu); Câu hỏi ý chính (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Câu hỏi paraphrasing (1 câu); Câu hỏi TRUE/NOT TRUE (1 câu)" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createBoldCell("7"), createCell(""), createCell(""), createCell("")
        ]
      }),

      // 4. Writing
      new TableRow({
        children: [
          createBoldCell("4", { rowSpan: 2 }),
          createBoldCell("Writing", { rowSpan: 2 }),
          createCell("1. Sắp xếp các câu thành 1 đoạn hội thoại/đoạn văn/lá thư/email/tin nhắn... (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Trật tự logic của đoạn hội thoại 40-60 từ (2 câu hỏi); Trật tự logic của đoạn văn/lá thư 80-100 từ (2 câu hỏi)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Hiểu được trật tự logic của đoạn văn/lá thư, tin nhắn" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Vận dụng hiểu biết về ngôn ngữ và logic của đoạn văn/lá thư/tin nhắn" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Viết theo chủ đề (1 bài)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Viết bài văn/bài báo 120-150 từ về chủ đề đã học (1 bài viết)" })] }),
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          createCell(""), createCell(""), createCell(""), createBoldCell("1")
        ]
      })
    );
  } else if (examData.level === "Tiểu học") {
    // TIỂU HỌC Spec
    rows.push(
      new TableRow({
        children: [
          createBoldCell("1", { rowSpan: 2 }),
          createBoldCell("Listening", { rowSpan: 2 }),
          createCell("1. Nghe và đánh dấu Đúng - Sai (True/False) (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nghe nhận biết tên, tuổi, quốc gia, thời gian trong các câu đơn (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Nghe hiểu xác định thông tin đúng/sai về sở thích, hoạt động (2 câu)" })] }),
            ]
          }),
          createCell(""), createBoldCell("4"), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Nghe và chọn câu trả lời đúng A, B, C (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nghe lấy thông tin thời gian biểu, bữa ăn, môn học (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Nghe hiểu lý do và hoạt động ngoài trời của nhân vật (2 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("2", { rowSpan: 2 }),
          createBoldCell("Language", { rowSpan: 2 }),
          createCell("1. Ngữ âm & Âm chữ cái (Phonics) (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nhận biết âm chữ cái và tổ hợp phụ âm đầu (/fr/, /tr/, /cl/...) (4 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Từ vựng & Mẫu câu (Odd one out, điền câu đơn) (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nhận biết từ vựng theo tranh, mẫu câu hỏi xuất xứ/khả năng (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Phân biệt từ khác loại (Odd one out) và liên từ trong câu đơn (2 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("3", { rowSpan: 2 }),
          createBoldCell("Reading", { rowSpan: 2 }),
          createCell("1. Đọc câu nhìn tranh / Đúng - Sai (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Đọc câu đơn và nhận biết tranh minh họa phù hợp (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Xác định câu miêu tả đúng hoặc sai so với ngữ cảnh (2 câu)" })] }),
            ]
          }),
          createCell(""), createBoldCell("4"), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Đọc hiểu đoạn văn 40-60 từ trả lời A, B, C (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Tìm thông tin chi tiết về trường lớp, thời gian biểu (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Hiểu lý do yêu thích môn học và hoạt động trong đoạn văn (1 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Hiểu ý chính và suy luận thông tin mở rộng (1 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("4", { rowSpan: 2 }),
          createBoldCell("Writing", { rowSpan: 2 }),
          createCell("1. Sắp xếp chữ cái tạo thành từ đúng chính tả (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Sắp xếp lại các chữ cái rời rạc thành từ có nghĩa (4 câu)" })] }),
            ]
          }),
          createCell(""), createCell(""), createBoldCell("4"), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Sắp xếp từ thành câu đơn hoàn chỉnh (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Sắp xếp từ ngữ thành câu đơn đúng trật tự từ, viết hoa và dấu câu (4 câu)" })] }),
            ]
          }),
          createCell(""), createCell(""), createCell(""), createBoldCell("4")
        ]
      })
    );
  } else {
    // THCS
    rows.push(
      new TableRow({
        children: [
          createBoldCell("1", { rowSpan: 2 }),
          createBoldCell("Listening", { rowSpan: 2 }),
          createCell("1. Nghe và chọn True/False (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nhận ra thông tin chi tiết cụ thể trong đoạn nghe 80-100 từ (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Xác định đúng/sai về ý kiến nhân vật (2 câu)" })] }),
            ]
          }),
          createCell(""), createBoldCell("4"), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Nghe và chọn đáp án đúng A, B, C, D (4 câu hỏi)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Nghe lấy thông tin địa điểm, thời gian (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Hiểu nội dung chính của hội thoại (2 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("2", { rowSpan: 2 }),
          createBoldCell("Language", { rowSpan: 2 }),
          createCell("1. Phát âm và Trọng âm (4 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Phát âm nguyên âm/phụ âm (2 câu); Trọng âm từ 2 âm tiết (2 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Từ vựng & Ngữ pháp (6 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Từ vựng chủ đề bài học; Các thì cơ bản (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Cụm động từ, câu so sánh (3 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Sử dụng liên từ trong câu phức (1 câu)" })] }),
            ]
          }),
          createBoldCell("6"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("3", { rowSpan: 2 }),
          createBoldCell("Reading", { rowSpan: 2 }),
          createCell("1. Đọc điền từ Cloze test (80-100 từ, 5 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Điền từ loại cơ bản (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Điền từ nối/đại từ quan hệ (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Điền từ vựng ngữ cảnh (1 câu)" })] }),
            ]
          }),
          createBoldCell("5"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Đọc hiểu văn bản (80-100 từ, 5 câu)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Biết: ", bold: true }), new TextRun({ text: "Tìm thông tin hiển ngôn chi tiết (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Xác định từ đồng nghĩa và ý chính (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Suy luận thái độ/cảm xúc (1 câu)" })] }),
            ]
          }),
          createBoldCell("5"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createBoldCell("4", { rowSpan: 2 }),
          createBoldCell("Writing", { rowSpan: 2 }),
          createCell("1. Tìm lỗi sai & Viết lại câu (4 câu - KHÔNG có Nhận biết theo CV 7991)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Hiểu: ", bold: true }), new TextRun({ text: "Phát hiện lỗi ngữ pháp cơ bản (2 câu)" })] }),
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Viết lại câu giữ nguyên nghĩa và sắp xếp từ (2 câu)" })] }),
            ]
          }),
          createBoldCell("4"), createCell(""), createCell(""), createCell("")
        ]
      }),
      new TableRow({
        children: [
          createCell("2. Viết đoạn văn ngắn (60-80 từ)", { alignment: AlignmentType.LEFT }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: "- Vận dụng: ", bold: true }), new TextRun({ text: "Viết đoạn văn ngắn theo chủ đề có gợi ý (1 bài)" })] }),
            ]
          }),
          createCell(""), createCell(""), createCell(""), createBoldCell("1")
        ]
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows
  });
};

// =========================================================================
// 3. TẠO CÁC PHƯƠNG ÁN A B C D CHUẨN IN ẤN (DỒN 1 HÀNG / 2 HÀNG / 4 HÀNG)
// =========================================================================
export const buildOptionsElementDocx = (options: string[]): Table | Paragraph => {
  if (!options || options.length === 0) return new Paragraph({ text: "" });

  const letters = ['A', 'B', 'C', 'D'];
  const formattedOptions = options.map((opt, idx) => {
    const trimmed = opt.trim();
    if (/^[A-D][\.\)\:]\s*/i.test(trimmed)) {
      return trimmed;
    }
    return `${letters[idx] || ''}. ${trimmed}`;
  });

  const maxLen = Math.max(...formattedOptions.map(opt => opt.length));
  const totalLen = formattedOptions.reduce((sum, opt) => sum + opt.length, 0);

  const makeOptionCellParagraph = (optText: string) => {
    const match = optText.match(/^([A-D]\.)\s*(.*)$/);
    if (match) {
      return new Paragraph({
        children: [
          new TextRun({ text: `${match[1]} `, bold: true, size: 22, font: "Times New Roman" }),
          new TextRun({ text: match[2], size: 22, font: "Times New Roman" })
        ],
        spacing: { before: 10, after: 20 }
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: optText, size: 22, font: "Times New Roman" })],
      spacing: { before: 10, after: 20 }
    });
  };

  // 1. Dồn trên 1 hàng (4 cột) nếu ngắn (maxLen <= 32 hoặc tổng <= 110 ký tự) - chuẩn in ấn tiết kiệm trang
  if ((maxLen <= 32 || totalLen <= 110) && formattedOptions.length === 4) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: invisibleBorders,
      rows: [
        new TableRow({
          children: formattedOptions.map(opt =>
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [makeOptionCellParagraph(opt)]
            })
          )
        })
      ]
    });
  }

  // 2. Dồn trên 2 hàng (mỗi hàng 2 phương án 50% - 50%) nếu vừa phải (maxLen <= 55 hoặc tổng <= 190 ký tự)
  if ((maxLen <= 55 || totalLen <= 190) && formattedOptions.length === 4) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: invisibleBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeOptionCellParagraph(formattedOptions[0])] }),
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeOptionCellParagraph(formattedOptions[1])] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeOptionCellParagraph(formattedOptions[2])] }),
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeOptionCellParagraph(formattedOptions[3])] }),
          ]
        })
      ]
    });
  }

  // 3. Mỗi phương án 1 hàng nếu dài > 55 ký tự
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: invisibleBorders,
    rows: formattedOptions.map(opt =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [makeOptionCellParagraph(opt)]
          })
        ]
      })
    )
  });
};

// =========================================================================
// 4. XÂY DỰNG NỘI DUNG ĐỀ THI CHUẨN MẪU BỘ GD&ĐT ĐÍNH KÈM
// =========================================================================
export const buildExamSectionsDocx = (examData: OfficialExamData) => {
  const elements: (Paragraph | Table)[] = [];

  // Xử lý tiêu đề chuẩn: Bỏ Phòng GD&ĐT, Sở GD&ĐT để trống (tự điền), Tên trường để trống (tự điền)
  const deptText = examData.departmentName?.trim() && !examData.departmentName.toUpperCase().includes("PHÒNG")
    ? (examData.departmentName.toUpperCase().startsWith("SỞ") ? examData.departmentName.toUpperCase() : `SỞ GD&ĐT ${examData.departmentName.toUpperCase()}`)
    : "SỞ GD&ĐT: ....................................................";

  const schoolText = examData.schoolName?.trim()
    ? (examData.schoolName.toUpperCase().startsWith("TRƯỜNG") ? examData.schoolName.toUpperCase() : `TRƯỜNG ${examData.schoolName.toUpperCase()}`)
    : "TRƯỜNG: ....................................................";

  const examYear = examData.year?.trim() ? examData.year : "2026 - 2027";

  // Header 2 cột có khung đóng mã đề chuẩn
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: invisibleBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: deptText, bold: true, size: 22 })], alignment: AlignmentType.CENTER }),
              new Paragraph({ children: [new TextRun({ text: schoolText, bold: true, size: 22 })], alignment: AlignmentType.CENTER }),
              new Paragraph({ text: "" }),
              new Paragraph({ children: [new TextRun({ text: "ĐỀ CHÍNH THỨC", bold: true, size: 22 })], alignment: AlignmentType.CENTER }),
              new Paragraph({ children: [new TextRun({ text: "(Đề thi gồm có 4 trang)", italics: true, size: 20 })], alignment: AlignmentType.CENTER }),
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: `ĐỀ KIỂM TRA ${examData.examPeriod.toUpperCase()}`, bold: true, size: 22 })], alignment: AlignmentType.CENTER }),
              new Paragraph({ children: [new TextRun({ text: `NĂM HỌC: ${examYear}`, bold: true, size: 22 })], alignment: AlignmentType.CENTER }),
              new Paragraph({ children: [new TextRun({ text: `MÔN: TIẾNG ANH KHỐI ${examData.grade}`, bold: true, size: 22 })], alignment: AlignmentType.CENTER }),
              new Paragraph({ children: [new TextRun({ text: `Thời gian làm bài: ${examData.duration} phút`, italics: true, size: 20 })], alignment: AlignmentType.CENTER }),
            ]
          })
        ]
      })
    ]
  });

  elements.push(headerTable);
  elements.push(new Paragraph({ text: "" }));

  // Phách và Mã đề đóng khung góc phải
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: invisibleBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 80, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Họ và tên học sinh: ..............................................................; Lớp: ........ Số báo danh: .....................", size: 22 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                children: [new TextRun({ text: `Mã đề: ${examData.examCode}`, bold: true, size: 22 })],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        ]
      })
    ]
  });

  elements.push(infoTable);
  elements.push(new Paragraph({ text: "" }));

  // ==========================================
  // A. LISTENING
  // ==========================================
  elements.push(
    new Paragraph({
      children: [new TextRun({ text: "A. LISTENING", bold: true, size: 24 })]
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "1. There are four questions in this part. For each question, decide whether the statement is TRUE or FALSE. Tick (√) the correct boxes. You will listen to the recording twice. (1.0 point)",
          bold: true,
          size: 22
        })
      ]
    }),
    new Paragraph({ text: "" })
  );

  // Bảng True / False có ô tick như mẫu PDF 2
  const tfTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          createBoldCell("STATEMENTS", { width: { size: 80, type: WidthType.PERCENTAGE }, alignment: AlignmentType.CENTER }),
          createBoldCell("A(true)", { width: { size: 10, type: WidthType.PERCENTAGE } }),
          createBoldCell("B(false)", { width: { size: 10, type: WidthType.PERCENTAGE } }),
        ]
      }),
      ...examData.listening.part1.questions.map(q =>
        new TableRow({
          children: [
            createCell(q.text, { alignment: AlignmentType.LEFT }),
            createCell(""),
            createCell(""),
          ]
        })
      )
    ]
  });

  elements.push(tfTable);
  elements.push(new Paragraph({ text: "" }));

  // Part 2 Listening
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: examData.listening.part2.title,
          bold: true,
          size: 22
        })
      ]
    }),
    new Paragraph({ text: "" })
  );

  examData.listening.part2.questions.forEach(q => {
    elements.push(new Paragraph({ children: [new TextRun({ text: q.text, bold: true, size: 22 })] }));
    if (q.options?.length) {
      elements.push(buildOptionsElementDocx(q.options));
    }
  });

  // ==========================================
  // B. LANGUAGE
  // ==========================================
  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "B. LANGUAGE", bold: true, size: 24 })]
    })
  );

  if (examData.language.isModernFormat && examData.language.text1 && examData.language.text2) {
    // 1. Advertisement 1
    elements.push(
      new Paragraph({ children: [new TextRun({ text: examData.language.text1.title, bold: true, size: 22 })] }),
      new Paragraph({ text: "" }),
      new Paragraph({ children: [new TextRun({ text: examData.language.text1.passage, italics: true, size: 22 })] }),
      new Paragraph({ text: "" })
    );

    examData.language.text1.questions.forEach(q => {
      elements.push(new Paragraph({ children: [new TextRun({ text: `${q.text}`, bold: true, size: 22 })] }));
      if (q.options?.length) {
        elements.push(buildOptionsElementDocx(q.options));
      }
    });

    // 2. Advertisement 2
    elements.push(
      new Paragraph({ text: "" }),
      new Paragraph({ children: [new TextRun({ text: examData.language.text2.title, bold: true, size: 22 })] }),
      new Paragraph({ text: "" }),
      new Paragraph({ children: [new TextRun({ text: examData.language.text2.passage, italics: true, size: 22 })] }),
      new Paragraph({ text: "" })
    );

    examData.language.text2.questions.forEach(q => {
      elements.push(new Paragraph({ children: [new TextRun({ text: `${q.text}`, bold: true, size: 22 })] }));
      if (q.options?.length) {
        elements.push(buildOptionsElementDocx(q.options));
      }
    });
  } else {
    // THCS & Tiểu học
    if (examData.language.phonetics?.length) {
      elements.push(new Paragraph({
        children: [new TextRun({
          text: examData.level === "Tiểu học" ? "1. Phonics & Alphabet sounds (1.25 points):" : "1. Pronunciation & Stress (1.0 point):",
          bold: true,
          size: 22
        })]
      }));
      examData.language.phonetics.forEach(q => {
        elements.push(new Paragraph({ children: [new TextRun({ text: q.text, bold: true, size: 22 })] }));
        if (q.options?.length) {
          elements.push(buildOptionsElementDocx(q.options));
        }
      });
    }
    if (examData.language.grammarVocab?.length) {
      elements.push(new Paragraph({ text: "" }));
      elements.push(new Paragraph({
        children: [new TextRun({
          text: examData.level === "Tiểu học" ? "2. Vocabulary & Sentence Patterns (1.25 points):" : "2. Vocabulary & Grammar (1.5 points):",
          bold: true,
          size: 22
        })]
      }));
      examData.language.grammarVocab.forEach(q => {
        elements.push(new Paragraph({ children: [new TextRun({ text: q.text, bold: true, size: 22 })] }));
        if (q.options?.length) {
          elements.push(buildOptionsElementDocx(q.options));
        }
      });
    }
  }

  // ==========================================
  // C. READING
  // ==========================================
  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "C. READING", bold: true, size: 24 })]
    }),
    new Paragraph({ children: [new TextRun({ text: examData.reading.part1.title, bold: true, size: 22 })] }),
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: examData.reading.part1.passage, size: 22 })] }),
    new Paragraph({ text: "" })
  );

  examData.reading.part1.questions.forEach(q => {
    elements.push(new Paragraph({ children: [new TextRun({ text: q.text, bold: true, size: 22 })] }));
    if (q.options?.length) {
      elements.push(buildOptionsElementDocx(q.options));
    }
  });

  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: examData.reading.part2.title, bold: true, size: 22 })] }),
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: examData.reading.part2.passage, size: 22 })] }),
    new Paragraph({ text: "" })
  );

  examData.reading.part2.questions.forEach(q => {
    elements.push(new Paragraph({ children: [new TextRun({ text: q.text, bold: true, size: 22 })] }));
    if (q.options?.length) {
      elements.push(buildOptionsElementDocx(q.options));
    }
  });

  // ==========================================
  // D. WRITING
  // ==========================================
  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "D. WRITING", bold: true, size: 24 })]
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: examData.level === "THPT"
            ? "1. Mark the letter A, B, C, or D to indicate the correct arrangement of the sentences to make a meaningful paragraph/letter in each of the following questions (1.0 point):"
            : examData.level === "Tiểu học"
            ? "1. Reorder the letters to make correct words (1.25 points):"
            : "1. Sentence transformation and error identification (1.0 point):",
          bold: true,
          size: 22
        })
      ]
    }),
    new Paragraph({ text: "" })
  );

  examData.writing.part1.forEach(q => {
    elements.push(new Paragraph({ children: [new TextRun({ text: q.text, size: 22 })] }));
    if (q.options?.length) {
      elements.push(buildOptionsElementDocx(q.options));
    }
    elements.push(new Paragraph({ text: "" }));
  });

  // Phần 2 Viết luận
  elements.push(
    new Paragraph({
      children: [new TextRun({ text: examData.writing.part2.prompt, bold: true, size: 22 })]
    }),
    new Paragraph({ text: "................................................................................................................................" }),
    new Paragraph({ text: "................................................................................................................................" }),
    new Paragraph({ text: "................................................................................................................................" }),
    new Paragraph({ text: "................................................................................................................................" }),
    new Paragraph({ text: "................................................................................................................................" }),
    new Paragraph({ text: "................................................................................................................................" }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "------------- The end -------------", bold: true, size: 22 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [new TextRun({ text: "Học sinh không được sử dụng tài liệu.", bold: true, size: 20 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [new TextRun({ text: "Cán bộ coi kiểm tra không giải thích gì thêm.", bold: true, size: 20 })],
      alignment: AlignmentType.CENTER
    })
  );

  return elements;
};

// =========================================================================
// 5. XÂY DỰNG ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT
// =========================================================================
export const buildAnswerKeyDocx = (examData: OfficialExamData) => {
  const elements: (Paragraph | Table)[] = [];

  elements.push(
    new Paragraph({
      children: [new TextRun({ text: "ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT", bold: true, size: 28 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [new TextRun({ text: `(Đề kiểm tra ${examData.examPeriod} môn Tiếng Anh Lớp ${examData.grade} - Mã đề ${examData.examCode})`, italics: true, size: 22 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "I. BẢNG ĐÁP ÁN NHANH (ANSWER KEY)", bold: true, size: 24 })]
    }),
    new Paragraph({ text: "" })
  );

  // Thu thập toàn bộ câu hỏi
  const allQs: { id: number; answer: string }[] = [];
  examData.listening.part1.questions.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
  examData.listening.part2.questions.forEach(q => allQs.push({ id: q.id, answer: q.answer }));

  if (examData.language.isModernFormat) {
    examData.language.text1?.questions.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
    examData.language.text2?.questions.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
  } else {
    examData.language.phonetics?.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
    examData.language.grammarVocab?.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
  }

  examData.reading.part1.questions.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
  examData.reading.part2.questions.forEach(q => allQs.push({ id: q.id, answer: q.answer }));
  examData.writing.part1.forEach(q => allQs.push({ id: q.id, answer: q.answer }));

  // Tạo bảng đáp án 4 cột
  const keyCells: TableCell[] = allQs.map(item =>
    new TableCell({
      borders: tableBorders,
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${item.id}: `, size: 20 }),
            new TextRun({ text: item.answer, bold: true, size: 22 })
          ],
          alignment: AlignmentType.CENTER
        })
      ]
    })
  );

  const keyRows: TableRow[] = [];
  for (let i = 0; i < keyCells.length; i += 4) {
    const chunk = keyCells.slice(i, i + 4);
    while (chunk.length < 4) {
      chunk.push(
        new TableCell({
          borders: tableBorders,
          children: [new Paragraph({ text: "" })]
        })
      );
    }
    keyRows.push(new TableRow({ children: chunk }));
  }

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: keyRows
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "II. HƯỚNG DẪN GIẢI CHI TIẾT TỪNG CÂU (DETAILED EXPLANATIONS)", bold: true, size: 24, font: "Times New Roman" })]
    }),
    new Paragraph({ text: "" })
  );

  const detailedList: ExamQuestion[] = [
    ...examData.listening.part1.questions,
    ...examData.listening.part2.questions,
    ...(examData.language.isModernFormat
      ? [...(examData.language.text1?.questions || []), ...(examData.language.text2?.questions || [])]
      : [...(examData.language.phonetics || []), ...(examData.language.grammarVocab || [])]),
    ...examData.reading.part1.questions,
    ...examData.reading.part2.questions,
    ...examData.writing.part1
  ];

  detailedList.forEach(q => {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• Câu ${q.id} (Đáp án ${q.answer}): `, bold: true, size: 22, font: "Times New Roman" }),
          new TextRun({ text: q.explanation || "Đáp án đúng theo bài học.", size: 22, font: "Times New Roman" })
        ],
        spacing: { before: 40, after: 20 }
      })
    );
    if (q.evidence) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `   Dẫn chứng: `, italics: true, bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: `"${q.evidence}"`, italics: true, size: 20, font: "Times New Roman" })
          ],
          spacing: { before: 10, after: 20 }
        })
      );
    }
    if (q.knowledgePoint) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `   Kiến thức trọng tâm: `, bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: q.knowledgePoint, size: 20, font: "Times New Roman" })
          ],
          spacing: { before: 10, after: 20 }
        })
      );
    }
  });

  // Rubrics viết
  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "III. HƯỚNG DẪN CHẤM BÀI VIẾT (WRITING RUBRICS) & BÀI MẪU", bold: true, size: 24, font: "Times New Roman" })]
    })
  );

  examData.writing.part2.rubrics.forEach(r => {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${r.criterion} (${r.point} điểm): `, bold: true, size: 22, font: "Times New Roman" }),
          new TextRun({ text: r.desc, size: 22, font: "Times New Roman" })
        ],
        spacing: { before: 20, after: 20 }
      })
    );
  });

  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "Bài viết mẫu tham khảo (Sample):", bold: true, size: 22, font: "Times New Roman" })]
    }),
    new Paragraph({
      children: [new TextRun({ text: examData.writing.part2.answer, italics: true, size: 22, font: "Times New Roman" })],
      spacing: { before: 20, after: 40 }
    })
  );

  // Audio Scripts
  elements.push(
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "IV. KỊCH BẢN BÀI NGHE (LISTENING AUDIO SCRIPTS)", bold: true, size: 24, font: "Times New Roman" })]
    }),
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: "1. Kịch bản Part 1:", bold: true, size: 22, font: "Times New Roman" })] }),
    new Paragraph({ children: [new TextRun({ text: examData.listening.part1.script, size: 20, font: "Times New Roman" })], spacing: { before: 20, after: 40 } }),
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: "2. Kịch bản Part 2:", bold: true, size: 22, font: "Times New Roman" })] }),
    new Paragraph({ children: [new TextRun({ text: examData.listening.part2.script, size: 20, font: "Times New Roman" })], spacing: { before: 20, after: 40 } })
  );

  return elements;
};

// Cấu hình chuẩn định dạng Word Times New Roman và căn lề A4 cho in ấn
const standardDocumentStyles = {
  default: {
    document: {
      run: {
        font: "Times New Roman",
        size: 22,
      },
      paragraph: {
        spacing: {
          line: 240,
          before: 20,
          after: 40,
        }
      }
    }
  }
};

const standardSectionProperties = {
  page: {
    margin: {
      top: 1000,
      bottom: 1000,
      left: 1134,
      right: 1000,
    }
  }
};

// =========================================================================
// 6. HÀM EXPORT FILE WORD CHÍNH THỨC
// =========================================================================

// Xuất trọn bộ Hồ sơ (Ma trận + Đặc tả + Đề thi + Hướng dẫn giải)
export const downloadFullPackageDocx = async (examData: OfficialExamData) => {
  if (!examData) return;

  const matrixTable = buildMatrixTableCV7991(examData);
  const specTable = buildSpecTableCV7991(examData);
  const examElements = buildExamSectionsDocx(examData);
  const answerKeyElements = buildAnswerKeyDocx(examData);

  const doc = new Document({
    styles: standardDocumentStyles,
    sections: [
      {
        properties: standardSectionProperties,
        children: [
          // 1. Ma trận đề
          new Paragraph({
            children: [new TextRun({ text: "BỘ GIÁO DỤC VÀ ĐÀO TẠO", bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.LEFT
          }),
          new Paragraph({
            children: [new TextRun({ text: "PHỤ LỤC", bold: true, size: 26, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: "(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)", italics: true, size: 20, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ MÔN TIẾNG ANH KHỐI ${examData.grade}`, bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          matrixTable,
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "CHÚ Ý:", bold: true, size: 20, font: "Times New Roman" })] }),
          new Paragraph({ children: [new TextRun({ text: "1. Bài kiểm tra kết hợp Tự luận, Trắc nghiệm khách quan 04 lựa chọn, chỉ có 01 câu trả lời đúng và Trắc nghiệm khách quan Đúng - Sai.", size: 20, font: "Times New Roman" })] }),
          new Paragraph({ children: [new TextRun({ text: "2. Bài Nghe True/ False có thể được thay bằng bài Nghe điền từ vào chỗ trống.", size: 20, font: "Times New Roman" })] }),
          new Paragraph({ children: [new TextRun({ text: `3. Tỷ lệ phân bổ mức độ nhận thức: ${examData.ratio?.nb ?? 40}% Nhận biết – ${examData.ratio?.th ?? 30}% Thông hiểu – ${examData.ratio?.vd ?? 30}% Vận dụng.`, size: 20, font: "Times New Roman" })] }),
          new Paragraph({ children: [new PageBreak()] }),

          // 2. Bản đặc tả đề
          new Paragraph({
            children: [new TextRun({ text: `2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ KHỐI ${examData.grade}`, bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: "(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)", italics: true, size: 20, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          specTable,
          new Paragraph({ children: [new PageBreak()] }),

          // 3. Đề kiểm tra
          ...examElements,
          new Paragraph({ children: [new PageBreak()] }),

          // 4. Đáp án và Hướng dẫn giải chi tiết
          ...answerKeyElements
        ]
      }
    ]
  });

  const cleanCode = (examData.examCode || "111").replace(/[^a-zA-Z0-9]/g, "") || "111";
  const levelSlug = examData.level === "Tiểu học" ? "TieuHoc" : examData.level === "THCS" ? "THCS" : "THPT";
  const blob = await Packer.toBlob(doc);
  triggerBrowserDownload(blob, `TronBo_HoSo_MaDe${cleanCode}_TA${examData.grade}_${levelSlug}_CV7991.docx`);
};

// Xuất riêng Đề thi
export const downloadTestPaperDocx = async (examData: OfficialExamData) => {
  const cleanCode = (examData.examCode || "111").replace(/[^a-zA-Z0-9]/g, "") || "111";
  const levelSlug = examData.level === "Tiểu học" ? "TieuHoc" : examData.level === "THCS" ? "THCS" : "THPT";
  const examElements = buildExamSectionsDocx(examData);
  const doc = new Document({
    styles: standardDocumentStyles,
    sections: [{ properties: standardSectionProperties, children: examElements }]
  });
  const blob = await Packer.toBlob(doc);
  triggerBrowserDownload(blob, `DeThi_MaDe${cleanCode}_TA${examData.grade}_${levelSlug}_CV7991.docx`);
};

// Xuất riêng Ma trận & Bản đặc tả
export const downloadMatrixAndSpecDocx = async (examData: OfficialExamData) => {
  const cleanCode = (examData.examCode || "111").replace(/[^a-zA-Z0-9]/g, "") || "111";
  const levelSlug = examData.level === "Tiểu học" ? "TieuHoc" : examData.level === "THCS" ? "THCS" : "THPT";
  const matrixTable = buildMatrixTableCV7991(examData);
  const specTable = buildSpecTableCV7991(examData);
  const doc = new Document({
    styles: standardDocumentStyles,
    sections: [
      {
        properties: standardSectionProperties,
        children: [
          new Paragraph({
            children: [new TextRun({ text: "BỘ GIÁO DỤC VÀ ĐÀO TẠO", bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.LEFT
          }),
          new Paragraph({
            children: [new TextRun({ text: "PHỤ LỤC", bold: true, size: 26, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: "(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)", italics: true, size: 20, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ KHỐI ${examData.grade}`, bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          matrixTable,
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            children: [new TextRun({ text: `2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ KHỐI ${examData.grade}`, bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: "(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)", italics: true, size: 20, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          specTable
        ]
      }
    ]
  });
  const blob = await Packer.toBlob(doc);
  triggerBrowserDownload(blob, `MaTran_DacTa_MaDe${cleanCode}_TA${examData.grade}_${levelSlug}_CV7991.docx`);
};

// Xuất riêng Đáp án & Hướng dẫn giải chi tiết
export const downloadAnswerKeyDocx = async (examData: OfficialExamData) => {
  const cleanCode = (examData.examCode || "111").replace(/[^a-zA-Z0-9]/g, "") || "111";
  const levelSlug = examData.level === "Tiểu học" ? "TieuHoc" : examData.level === "THCS" ? "THCS" : "THPT";
  const answerKeyElements = buildAnswerKeyDocx(examData);
  const doc = new Document({
    styles: standardDocumentStyles,
    sections: [{ properties: standardSectionProperties, children: answerKeyElements }]
  });
  const blob = await Packer.toBlob(doc);
  triggerBrowserDownload(blob, `DapAn_HuongDanCham_MaDe${cleanCode}_TA${examData.grade}_${levelSlug}_CV7991.docx`);
};
