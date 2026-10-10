/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExamQuestion {
  id: number;
  text: string;
  options?: string[];
  type?: "MCQ" | "TF" | "ARRANGE" | "REWRITE" | "ESSAY";
  answer: string;
  level: "Nhận biết" | "Thông hiểu" | "Vận dụng";
  explanation?: string;
  evidence?: string;
  knowledgePoint?: string;
}

export interface ExamSection {
  title: string;
  points: number;
  description?: string;
  script?: string;
  passage?: string;
  questions: ExamQuestion[];
}

export interface MatrixRow {
  skill: string;
  itemType: string;
  mcq: { nb: number; th: number; vd: number };
  tf: { nb: number; th: number; vd: number };
  short: { nb: number; th: number; vd: number };
  essay: { nb: number; th: number; vd: number };
  totalQs: number;
  totalPoints: number;
  percentage: number;
}

export interface SpecRow {
  skill: string;
  domain: string;
  outcomes: {
    nb: string[];
    th: string[];
    vd: string[];
  };
  questionRange: string;
  totalQs: number;
}

export interface OfficialExamData {
  id: string;
  level: "Tiểu học" | "THCS" | "THPT";
  grade: string;
  examPeriod: string;
  schoolName: string;
  departmentName: string;
  examCode: string;
  duration: number;
  year: string;
  ratio: { nb: number; th: number; vd: number };
  
  // Ma trận & Đặc tả
  matrix: MatrixRow[];
  spec: SpecRow[];

  // Nội dung đề thi
  listening: {
    part1: { title: string; script: string; questions: ExamQuestion[] };
    part2: { title: string; script: string; questions: ExamQuestion[] };
  };
  language: {
    isModernFormat?: boolean; // THPT announcement/ad format vs THCS traditional
    text1?: { title: string; passage: string; questions: ExamQuestion[] };
    text2?: { title: string; passage: string; questions: ExamQuestion[] };
    phonetics?: ExamQuestion[];
    grammarVocab?: ExamQuestion[];
  };
  reading: {
    part1: { title: string; passage: string; questions: ExamQuestion[] };
    part2: { title: string; passage: string; questions: ExamQuestion[] };
  };
  writing: {
    part1: ExamQuestion[];
    part2: { prompt: string; wordLimit: string; answer: string; rubrics: { criterion: string; point: number; desc: string }[] };
  };
  speaking?: {
    part1: { title: string; points: number; criteria: { name: string; point: number }[] };
    part2: { title: string; points: number; topics: string[]; rubrics: { criterion: string; point: number }[] };
  };
}

// 1. ĐỀ CHUẨN THPT LỚP 11 THEO CÔNG VĂN 7991 (Global Success)
export const OFFICIAL_EXEMPLAR_THPT_11: OfficialExamData = {
  id: "thpt-11-official-7991",
  level: "THPT",
  grade: "11",
  examPeriod: "Cuối học kì I",
  schoolName: "",
  departmentName: "",
  examCode: "111",
  duration: 60,
  year: "2026 - 2027",
  ratio: { nb: 40, th: 30, vd: 30 },
  
  matrix: [
    {
      skill: "Listening",
      itemType: "1. Nghe chọn câu trả lời đúng (4 câu)\n2. Nghe chọn True/False (4 câu)",
      mcq: { nb: 2, th: 2, vd: 0 },
      tf: { nb: 2, th: 2, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 8,
      totalPoints: 2.0,
      percentage: 20
    },
    {
      skill: "Language",
      itemType: "Chọn từ/cụm từ đúng điền vào chỗ trống trong 2 quảng cáo/thông báo (mỗi bài 6 câu)",
      mcq: { nb: 7, th: 2, vd: 3 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 12,
      totalPoints: 3.0,
      percentage: 30
    },
    {
      skill: "Reading",
      itemType: "1. Đọc điền cụm từ/mệnh đề vào chỗ trống (5 câu)\n2. Đọc hiểu bài đọc 250-280 từ (7 câu)",
      mcq: { nb: 3, th: 5, vd: 4 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 12,
      totalPoints: 3.0,
      percentage: 30
    },
    {
      skill: "Writing",
      itemType: "1. Sắp xếp câu thành đoạn hội thoại/lá thư/đoạn văn (4 câu)\n2. Viết bài văn theo chủ đề 120-150 từ (1 bài)",
      mcq: { nb: 2, th: 1, vd: 1 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 1 },
      totalQs: 5,
      totalPoints: 2.0,
      percentage: 20
    }
  ],

  spec: [
    {
      skill: "Listening",
      domain: "Kỹ năng nghe hiểu hội thoại và thông báo (Chủ đề Housework & Plastic Waste Free)",
      outcomes: {
        nb: ["Nghe và nhận ra thông tin chi tiết cụ thể về phân công việc nhà trong gia đình.", "Nhận diện mốc thời gian và hoạt động trực tiếp của các bạn trẻ."],
        th: ["Hiểu ý chính và mục tiêu bảo vệ sinh vật biển của dự án cộng đồng ở bãi biển.", "Suy luận thái độ và sự tương trợ giữa các nhóm học sinh."],
        vd: ["Không kiểm tra mức vận dụng ở phần nghe hiểu."]
      },
      questionRange: "Câu 1 - Câu 8",
      totalQs: 8
    },
    {
      skill: "Language",
      domain: "Kiến thức ngôn ngữ trong 2 thông báo/quảng cáo (Unit 4: ASEAN & Unit 5: Global Warming)",
      outcomes: {
        nb: [
          "Thời của động từ: Quá khứ đơn / Hiện tại hoàn thành (1 câu)",
          "Đại từ quan hệ: who, which, where, that (1 câu)",
          "Trật tự từ (Word order): tính từ ghép, danh từ (1 câu)",
          "Dạng động từ: V-ing làm chủ ngữ/sau giới từ (1 câu)",
          "Động từ khuyết thiếu: must, should, could, might (1 câu)",
          "Từ loại (Parts of speech): tính từ đuôi -ing/-ed (1 câu)",
          "Giới từ (Prepositions) chỉ mục đích/thời gian (1 câu)"
        ],
        th: [
          "Liên từ (Conjunctions): but, and, or, so (1 câu)",
          "Từ hạn định / Lượng từ (Quantifiers): little, much, many, few (1 câu)"
        ],
        vd: [
          "Từ vựng theo ngữ cảnh (Contextual vocabulary): carbon footprints (2 câu)",
          "Cụm từ cố định (Collocation): look forward to + V-ing (1 câu)"
        ]
      },
      questionRange: "Câu 9 - Câu 20",
      totalQs: 12
    },
    {
      skill: "Reading",
      domain: "Kỹ năng đọc hiểu theo mạch chủ điểm (Unit 4 & Unit 5: Giáo dục ASEAN & Biến đổi khí hậu)",
      outcomes: {
        nb: [
          "Điền từ quy chiếu / cụm từ cố định (1 câu)",
          "Câu hỏi thông tin chi tiết hiển ngôn trong bài đọc (1 câu)",
          "Câu hỏi quy chiếu từ thay thế 'It', 'They' (1 câu)"
        ],
        th: [
          "Điền câu hoàn chỉnh liên kết logic (1 câu)",
          "Điền cụm từ phù hợp ngữ cảnh (1 câu)",
          "Từ đồng nghĩa / trái nghĩa trong ngữ cảnh: từ 'vast' (1 câu)",
          "Tìm vị trí đoạn văn chứa thông tin giải pháp (1 câu)",
          "Xác định ý chính bao quát toàn bài đọc (1 câu)"
        ],
        vd: [
          "Điền mệnh đề trạng ngữ chỉ thời gian / nguyên nhân - nhượng bộ (2 câu)",
          "Câu hỏi viết lại câu / Paraphrasing ý chính trong đoạn (1 câu)",
          "Câu hỏi phân tích đúng/sai (TRUE / NOT TRUE) dựa trên suy luận logic (1 câu)"
        ]
      },
      questionRange: "Câu 21 - Câu 32",
      totalQs: 12
    },
    {
      skill: "Writing",
      domain: "Kỹ năng tạo lập văn bản và sắp xếp logic (Short-form content, Smart City, Lớp học trực tuyến)",
      outcomes: {
        nb: ["Nhận biết trật tự logic của hội thoại giao tiếp 40 - 60 từ (2 câu)."],
        th: ["Hiểu trật tự cấu trúc bức thư/thông báo của giáo viên khoảng 80 - 100 từ (1 câu)."],
        vd: [
          "Vận dụng hiểu biết về liên kết mạch lạc sắp xếp bài luận về mạng xã hội (1 câu).",
          "Vận dụng kiến thức viết bài báo 120 - 150 từ về lợi ích của việc sống trong thành phố thông minh (1 bài)."
        ]
      },
      questionRange: "Câu 33 - Câu 36 & Bài viết luận",
      totalQs: 5
    }
  ],

  listening: {
    part1: {
      title: "1. Listen to the conversation about boys and housework and decide whether the statement is TRUE or FALSE (1.0 point)",
      script: `Host: They say that boys don't do housework. Is it true? What do you think? We have Robert on the phone. He's 16 and he's from Michigan. Robert, do boys do housework?
Robert: Yes, they do. I'm a boy and I do lots of housework.
Host: So, what housework do you do, Robert?
Robert: Well, I have to make my bed every morning and clean my room every evening.
Host: Do you cook or wash the dishes?
Robert: No, I don't cook, but I usually clear the table and load the dishwasher after dinner.
Host: OK, thank you, Robert. We have caller number 2. Hello, and what's your name?
Julie: Hi, my name's Julie.
Host: What do you think, Julie? Do boys do housework?
Julie: No, they don't. My brother never does any housework.
Host: And how old is your brother, Julie?
Julie: He's 11 years old. He doesn't have to make his bed or clean his room.
Host: Really? Who cleans his room?
Julie: My mom. But I have to do lots of housework. I have to make my bed and I have to clean my room. Yesterday, I had to wash the dishes and take the dog for a walk. It isn't fair.
Host: Thank you, Julie. What do you think? Call us at 212 555 3641.`,
      questions: [
        {
          id: 1,
          text: "Question 1: Robert doesn’t have to clean his room.",
          options: ["A. True", "B. False"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Robert nói rõ: 'Well, I have to make my bed every morning and clean my room every evening.' -> Cậu ấy phải dọn phòng, do đó nhận định không phải dọn là Sai (False).",
          evidence: "Robert: 'Well, I have to make my bed every morning and clean my room every evening.'"
        },
        {
          id: 2,
          text: "Question 2: Robert usually clears the table.",
          options: ["A. True", "B. False"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Robert nói: '...but I usually clear the table and load the dishwasher after dinner.' -> Nhận định Đúng (True).",
          evidence: "Robert: '...but I usually clear the table and load the dishwasher after dinner.'"
        },
        {
          id: 3,
          text: "Question 3: Julie says that boys do lots of housework.",
          options: ["A. True", "B. False"],
          answer: "B",
          level: "Thông hiểu",
          explanation: "Khi người dẫn chương trình hỏi: 'Do boys do housework?', Julie trả lời: 'No, they don't. My brother never does any housework.' -> Julie cho rằng con trai không làm việc nhà, do đó nhận định Julie nói con trai làm nhiều việc nhà là Sai (False).",
          evidence: "Julie: 'No, they don't. My brother never does any housework.'"
        },
        {
          id: 4,
          text: "Question 4: Yesterday Julie had to wash the dishes and take the dog for a walk.",
          options: ["A. True", "B. False"],
          answer: "A",
          level: "Thông hiểu",
          explanation: "Julie nói: 'Yesterday, I had to wash the dishes and take the dog for a walk.' -> Khớp hoàn toàn với lời thoại, đáp án Đúng (True).",
          evidence: "Julie: 'Yesterday, I had to wash the dishes and take the dog for a walk.'"
        }
      ]
    },
    part2: {
      title: "2. Listen to the conversation between Helen and Mai and choose the correct answer A, B, C or D (1.0 point)",
      script: `Helen: Hello, Mai. How was your weekend?
Mai: Fantastic! I spent my lovely weekend in Vũng Tàu with my schoolmates and classmates.
Helen: Oh, really? You all had a wonderful beach holiday?
Mai: Actually, it was not exactly a beach holiday. Our class had a project to carry out, namely 'Plastic waste free'.
Helen: Sounds interesting! What was it exactly?
Mai: Well, we must collect the waste people left on the beach. Our responsibility was to clean an area of the beach where many people visited during high season. My principal said that the project aimed to reduce plastic waste and give a better environment for marine creatures. And I think public engagement and awareness are also the main purposes of this type of project. There are often lots of students who are quite irresponsible when they drop litter after events. So the project will help them think about their duty to the environment.
Helen: I totally agree with you. Your class did a very good job picking up litter, didn't you?
Mai: Of course! We collected dozens of rubbish such as plastic bags, disposable bottles, and other kinds of trash. It took us half a day to do, and we were divided into small groups. Our group finished in about three hours, and then we supported the other groups. It was really good teamwork! We didn't feel exhausted because it was lots of fun.`,
      questions: [
        {
          id: 5,
          text: "Question 5: What did Mai do on her weekend?",
          options: [
            "A. She carried out a community project at the beach.",
            "B. She went to the beach with her family.",
            "C. She went to swim with her classmates at the beach.",
            "D. She went to drop litter at the beach with her class."
          ],
          answer: "A",
          level: "Nhận biết",
          explanation: "Mai nói: 'Our class had a project to carry out, namely Plastic waste free... to clean an area of the beach' -> Đây là một dự án cộng đồng làm sạch bãi biển.",
          evidence: "Mai: 'Our class had a project to carry out, namely Plastic waste free.'"
        },
        {
          id: 6,
          text: "Question 6: How long did it take Mai’s class to collect all the litter?",
          options: [
            "A. Three hours and a half",
            "B. All day",
            "C. A half of day",
            "D. Three hours"
          ],
          answer: "C",
          level: "Nhận biết",
          explanation: "Mai nói về cả lớp: 'It took us half a day to do, and we were divided into small groups.' (Riêng nhóm của Mai xong trong 3 giờ rồi đi giúp nhóm khác). Vì vậy cả lớp mất nửa ngày (A half of day).",
          evidence: "Mai: 'It took us half a day to do, and we were divided into small groups.'"
        },
        {
          id: 7,
          text: "Question 7: How much rubbish did they pick up?",
          options: [
            "A. 3 kilograms",
            "B. A ton of rubbish",
            "C. 12 kilograms",
            "D. A lot of rubbish"
          ],
          answer: "D",
          level: "Thông hiểu",
          explanation: "Mai nói: 'We collected dozens of rubbish such as plastic bags, disposable bottles, and other kinds of trash' -> tương đương với 'A lot of rubbish'.",
          evidence: "Mai: 'We collected dozens of rubbish such as plastic bags, disposable bottles, and other kinds of trash.'"
        },
        {
          id: 8,
          text: "Question 8: What did Mai’s group do after finishing collecting rubbish?",
          options: [
            "A. They assisted the other groups.",
            "B. They had some free time to relax on the beach.",
            "C. They took photos of their achievement.",
            "D. They think about their duty to the environment."
          ],
          answer: "A",
          level: "Thông hiểu",
          explanation: "Mai nói: 'Our group finished in about three hours, and then we supported the other groups.' -> 'supported' đồng nghĩa với 'assisted' (hỗ trợ các nhóm khác).",
          evidence: "Mai: '...and then we supported the other groups.'"
        }
      ]
    }
  },

  language: {
    isModernFormat: true,
    text1: {
      title: "1. Read the following advertisement and mark the letter A, B, C or D to indicate the option that best fits each of the numbered blanks (1.5 points)",
      passage: `Explore ASEAN & Vietnam: A Cultural Festival
Join us for an exciting cultural festival that celebrates the traditions and beauty of ASEAN and Vietnam! We (9) ………….. (invite) many local and international guests to experience the rich cultures of the region. You can enjoy various activities, (10) ………….. simply relax and learn more about the art, food, and music. The festival will (11) ………….. traditional dance performances, local cuisine, and an exhibition of arts and crafts, (12) …………. represent the diversity of ASEAN countries. This is an event you (13) ………….. not miss! Whether you're interested in exploring new cultures, trying new foods, or meeting people, there’s something (14) ………….. for everyone. Don’t wait! Come and be part of this unforgettable experience!`,
      questions: [
        {
          id: 9,
          text: "Question 9:",
          options: ["A. invited", "B. have invited", "C. invites", "D. invite"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Dùng thì Hiện tại hoàn thành 'have invited' để diễn tả hành động đã hoàn tất trước thời điểm diễn ra lễ hội nhưng để lại kết quả ở hiện tại (các khách mời đã được mời xong để tham gia sự kiện).",
          knowledgePoint: "Present Perfect Tense"
        },
        {
          id: 10,
          text: "Question 10:",
          options: ["A. but", "B. and", "C. or", "D. so"],
          answer: "C",
          level: "Thông hiểu",
          explanation: "Liên từ 'or' diễn tả sự lựa chọn giữa các hoạt động: 'enjoy various activities, or simply relax...' (tham gia các hoạt động, hoặc đơn giản chỉ thư giãn).",
          knowledgePoint: "Coordinating Conjunctions"
        },
        {
          id: 11,
          text: "Question 11:",
          options: ["A. include", "B. consist", "C. involve", "D. have"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Sau động từ khuyết thiếu 'will' cần động từ nguyên mẫu có tân ngữ trực tiếp: 'include something' (bao gồm). 'Consist' phải đi với 'of'.",
          knowledgePoint: "Verb + Direct Object"
        },
        {
          id: 12,
          text: "Question 12:",
          options: ["A. who", "B. which", "C. where", "D. that"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Đại từ quan hệ 'which' thay thế cho danh từ chỉ vật phía trước trong mệnh đề quan hệ không xác định có dấu phẩy: '..., which represent the diversity...'. 'That' không đứng sau dấu phẩy.",
          knowledgePoint: "Relative Pronouns"
        },
        {
          id: 13,
          text: "Question 13:",
          options: ["A. must", "B. should", "C. could", "D. might"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Cụm thành ngữ thông dụng 'must not miss' dùng để nhấn mạnh một sự kiện vô cùng hấp dẫn mà bạn không thể bỏ lỡ.",
          knowledgePoint: "Modal Verbs of Obligation/Recommendation"
        },
        {
          id: 14,
          text: "Question 14:",
          options: ["A. excite", "B. excited", "C. exciting", "D. excitingly"],
          answer: "C",
          level: "Nhận biết",
          explanation: "Sau đại từ bất định 'something', tính từ đứng sau để bổ nghĩa: 'something exciting' (điều gì đó thú vị). Tính từ đuôi -ing miêu tả bản chất của sự vật.",
          knowledgePoint: "Adjective after Indefinite Pronoun"
        }
      ]
    },
    text2: {
      title: "2. Read the following advertisement and mark the letter A, B, C or D to indicate the option that best fits each of the numbered blanks (1.5 points)",
      passage: `Take Action Against Global Warming!
Global warming is one of the biggest challenges our planet faces today. (15) ………… scientists have warned about the serious effects of climate change. It is important for everyone to take action now to protect the Earth. You can join (16) ………… aimed at raising awareness and reducing (17) …………. By participating in activities such as tree planting, recycling, and using less plastic, you can contribute to saving the environment. The event (18) ……… by local volunteers, and it will take place this Saturday. (19) …………. pollution is essential for protecting our future. Don’t miss this chance to make a difference! We look forward (20) …………. seeing you there!`,
      questions: [
        {
          id: 15,
          text: "Question 15:",
          options: ["A. little", "B. much", "C. many", "D. few"],
          answer: "C",
          level: "Thông hiểu",
          explanation: "'scientists' là danh từ đếm được số nhiều, ngữ cảnh mang nghĩa khẳng định số lượng lớn các nhà khoa học đã cảnh báo -> dùng 'Many'.",
          knowledgePoint: "Quantifiers with Countable Nouns"
        },
        {
          id: 16,
          text: "Question 16:",
          options: ["A. our exciting campaign", "B. our campaign exciting", "C. exciting our campaign", "D. exciting campaign our"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Trật tự từ của cụm danh từ: Tính từ sở hữu (our) + Tính từ miêu tả (exciting) + Danh từ chính (campaign) -> 'our exciting campaign'.",
          knowledgePoint: "Noun Phrase Word Order"
        },
        {
          id: 17,
          text: "Question 17:",
          options: ["A. carbon foot", "B. footprints", "C. carbon footprints", "D. carbon dioxide footprint"],
          answer: "C",
          level: "Vận dụng",
          explanation: "Thuật ngữ chuyên ngành trong Unit 5: 'carbon footprints' (dấu chân carbon / lượng khí thải carbon).",
          knowledgePoint: "Environmental Terminology / Collocations"
        },
        {
          id: 18,
          text: "Question 18:",
          options: ["A. is organized", "B. organize", "C. organizing", "D. to organize"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Chủ ngữ là 'The event' và có tác nhân 'by local volunteers' -> câu bị động thì hiện tại đơn: 'is organized'.",
          knowledgePoint: "Passive Voice"
        },
        {
          id: 19,
          text: "Question 19:",
          options: ["A. reduced", "B. reducing", "C. reduces", "D. reduce"],
          answer: "B",
          level: "Vận dụng",
          explanation: "Đứng đầu câu làm chủ ngữ của động từ 'is essential' phải là Danh động từ (Gerund): 'Reducing pollution...'.",
          knowledgePoint: "Gerund as Subject"
        },
        {
          id: 20,
          text: "Question 20:",
          options: ["A. for", "B. on", "C. with", "D. to"],
          answer: "D",
          level: "Vận dụng",
          explanation: "Cấu trúc cố định: 'look forward to + V-ing' (trông mong, đón chờ điều gì).",
          knowledgePoint: "Phrasal Verb / Prepositional Phrase"
        }
      ]
    }
  },

  reading: {
    part1: {
      title: "1. Read the following passage and mark the letter A, B, C or D to indicate the option that best fits each of the numbered blanks (1.25 points)",
      passage: `The ASEAN School Tour Programme is an exciting opportunity for students from ASEAN countries to learn more about each other's cultures and education systems. The programme (21)…………. to encourage cooperation, understanding, and friendship among young people in Southeast Asia. (22) …………..
Students will participate in various activities, such as school tours, cultural exchanges, and language workshops. This experience helps students improve (23) …………. and make new friends. (24) ………….……… the programme, participants also have the chance to explore the local culture and history of each country they visit. For example, they will learn about traditional festivals, foods, and customs that are unique to each region.
The programme usually takes place during the summer holidays. The reason it is scheduled then is to ensure that students have enough free time to join without disrupting their school schedules. In addition, the programme offers opportunities to see the different types of education systems in ASEAN countries. This helps students gain a deeper understanding of the diversity in Southeast Asia.
(25) ………….………, the ASEAN School Tour Programme could be an excellent choice for you!`,
      questions: [
        {
          id: 21,
          text: "Question 21:",
          options: ["A. design", "B. designing", "C. is designed", "D. designs"],
          answer: "C",
          level: "Nhận biết",
          explanation: "Chủ ngữ là 'The programme' mang nghĩa bị động: 'chương trình được thiết kế nhằm mục đích...' -> 'is designed to encourage'.",
          knowledgePoint: "Passive Voice with Infinitive of Purpose"
        },
        {
          id: 22,
          text: "Question 22:",
          options: [
            "A. It usually lasts for two weeks, during that students will visit several schools in different countries.",
            "B. It usually lasts for two weeks, during which students will visit several schools in different countries.",
            "C. It usually lasts for two weeks, which students will visit several schools in different countries.",
            "D. It usually lasts for two weeks, students will visit several schools in different countries."
          ],
          answer: "B",
          level: "Thông hiểu",
          explanation: "Mệnh đề quan hệ đi với giới từ: 'during which' (trong khoảng thời gian đó, học sinh sẽ đi thăm nhiều trường học...). 'that' không đi sau giới từ.",
          knowledgePoint: "Preposition + Relative Pronoun"
        },
        {
          id: 23,
          text: "Question 23:",
          options: ["A. my language skills", "B. its language skills", "C. their language skills", "D. his language skills"],
          answer: "C",
          level: "Nhận biết",
          explanation: "Chủ ngữ ở câu trước là 'students' (số nhiều) -> tính từ sở hữu tương ứng phải là 'their language skills'.",
          knowledgePoint: "Possessive Adjectives Agreement"
        },
        {
          id: 24,
          text: "Question 24:",
          options: ["A. To take part in", "B. After taking part in", "C. When took part in", "D. When taking part in"],
          answer: "D",
          level: "Vận dụng",
          explanation: "Mệnh đề trạng ngữ rút gọn cùng chủ ngữ với mệnh đề chính: 'When (they take) part in...' rút gọn thành 'When taking part in the programme...'.",
          knowledgePoint: "Reduced Adverbial Clause with Participle"
        },
        {
          id: 25,
          text: "Question 25:",
          options: [
            "A. Because if you are a student looking to expand your horizons and meet new people",
            "B. Therefore, if you are a student looking to expand your horizons and meet new people",
            "C. But, you are a student looking to expand your horizons and meet new people",
            "D. So, if you are a student looking to expand your horizons and meet new people"
          ],
          answer: "B",
          level: "Vận dụng",
          explanation: "Câu kết luận logic sau khi đã phân tích các ưu điểm của chương trình ở các đoạn trước: 'Therefore, if you are a student looking to expand your horizons...' (Do đó, nếu bạn là học sinh đang muốn mở rộng tầm nhìn...).",
          knowledgePoint: "Transitional Adverbs & Conditional Sentence"
        }
      ]
    },
    part2: {
      title: "2. Read the following passage about global warming and choose the correct answer A, B, C, or D (1.75 points)",
      passage: `Global warming is one of the most urgent issues facing the world today. It refers to the long-term increase in Earth's average surface temperature due to human activities, such as burning fossil fuels and deforestation. These activities release large amounts of carbon dioxide and other greenhouse gases into the atmosphere, which trap heat and cause the planet to warm up. As a result, the Earth’s climate is changing, leading to extreme weather patterns, rising sea levels, and melting ice caps.
The consequences of global warming are vast and alarming. For example, warmer temperatures can lead to more intense heatwaves, which can harm human health, especially among vulnerable populations. Rising sea levels, caused by the melting of polar ice, threaten coastal cities and island nations. Additionally, droughts, floods, and severe storms are becoming more frequent, affecting agriculture and food security around the world. The natural ecosystems, too, are being damaged, with many species facing extinction due to changing habitats.
To tackle global warming, urgent action is needed. Governments and individuals must work together to reduce carbon emissions by shifting to renewable energy sources, such as solar and wind power. Planting more trees and protecting forests can help absorb carbon dioxide from the atmosphere. People must also adopt more sustainable lifestyles by reducing waste, recycling, and using public transportation. By making these changes, we can slow down the effects of global warming and help protect our planet for future generations.`,
      questions: [
        {
          id: 26,
          text: "Question 26: The word “vast” in paragraph 2 could be best replaced by _______.",
          options: ["A. huge", "B. preserve", "C. create", "D. increase"],
          answer: "A",
          level: "Thông hiểu",
          explanation: "Từ 'vast' nghĩa là 'rộng lớn, to lớn, bao la', đồng nghĩa với 'huge' (khổng lồ, to lớn).",
          knowledgePoint: "Synonym in Context"
        },
        {
          id: 27,
          text: "Question 27: The word “It” in paragraph 1 refers to ______",
          options: ["A. urgent issues", "B. the world", "C. consequence", "D. global warming"],
          answer: "D",
          level: "Nhận biết",
          explanation: "'Global warming is one of the most urgent issues... It refers to...' -> 'It' thay thế cho danh từ 'Global warming' đứng ngay trước.",
          evidence: "Global warming is one of the most urgent issues facing the world today. It refers to the long-term increase..."
        },
        {
          id: 28,
          text: "Question 28: Which of the following is NOT mentioned as a consequence of global warming?",
          options: [
            "A. Health problems due to heatwaves",
            "B. Rising sea levels",
            "C. Melting of ice caps",
            "D. Decrease in the use of renewable energy"
          ],
          answer: "D",
          level: "Thông hiểu",
          explanation: "Đoạn 2 liệt kê các hậu quả: heatwaves harming human health (A), rising sea levels (B), melting of polar ice (C). Việc giảm năng lượng tái tạo không phải là hậu quả (năng lượng tái tạo là giải pháp ở đoạn 3).",
          evidence: "Paragraph 2 mentions: heatwaves, melting of polar ice, rising sea levels, droughts, floods."
        },
        {
          id: 29,
          text: "Question 29: In which paragraph does the writer discuss solutions to global warming?",
          options: ["A. Paragraph 1", "B. Paragraph 2", "C. Paragraph 3", "D. Paragraph 2 & 3"],
          answer: "C",
          level: "Thông hiểu",
          explanation: "Đoạn 3 mở đầu bằng: 'To tackle global warming, urgent action is needed...' và nêu ra các biện pháp: shifting to renewable energy, planting trees, adopting sustainable lifestyles.",
          evidence: "Paragraph 3: 'To tackle global warming, urgent action is needed. Governments and individuals must work together...'"
        },
        {
          id: 30,
          text: "Question 30: Which of the following is TRUE according to the passage?",
          options: [
            "A. Global warming only affects human populations.",
            "B. The use of renewable energy sources is the most important solution to global warming.",
            "C. Deforestation contributes to global warming.",
            "D. Heatwaves are not a result of global warming."
          ],
          answer: "C",
          level: "Thông hiểu",
          explanation: "Đoạn 1 nêu: '...due to human activities, such as burning fossil fuels and deforestation' -> Nạn phá rừng (Deforestation) đóng góp vào hiện tượng nóng lên toàn cầu.",
          evidence: "Paragraph 1: '...due to human activities, such as burning fossil fuels and deforestation.'"
        },
        {
          id: 31,
          text: "Question 31: Which of the following best paraphrases the sentence in bold in paragraph 3: 'To tackle global warming, urgent action is needed.'?",
          options: [
            "A. It is too late to act against global warming.",
            "B. Global warming cannot be stopped without strong action.",
            "C. Global warming is a problem that is not urgent.",
            "D. Immediate efforts are necessary to address global warming."
          ],
          answer: "D",
          level: "Vận dụng",
          explanation: "'urgent action' tương đương với 'Immediate efforts', 'tackle' tương đương với 'address', 'is needed' tương đương với 'are necessary'. Do đó D là câu diễn đạt lại hoàn hảo nhất.",
          knowledgePoint: "Paraphrasing / Vocabulary transformation"
        },
        {
          id: 32,
          text: "Question 32: Which sentence below best summarizes the main idea of the passage?",
          options: [
            "A. People should take actions to tackle global warming",
            "B. The Earth’s surface temperature is increasing rapidly.",
            "C. Global warming has serious consequences and urgent action should be taken to address global warming",
            "D. Governments need to reduce carbon emissions"
          ],
          answer: "C",
          level: "Vận dụng",
          explanation: "Bài đọc có 3 đoạn: Đoạn 1 định nghĩa hiện tượng, Đoạn 2 nêu các hậu quả nghiêm trọng, Đoạn 3 nêu các hành động cấp bách cần thực hiện. Vì vậy câu C thâu tóm toàn diện nhất tư tưởng của tác giả.",
          knowledgePoint: "Main Idea Synthesis"
        }
      ]
    }
  },

  writing: {
    part1: [
      {
        id: 33,
        text: "Question 33:\na. Minh: She was really nervous about it, but I think she did quite well.\nb. Anna: I hope she gets the score she needs for her university application.\nc. Anna: Hi, Minh! How did your sister do on her IELTS exam?",
        options: ["A. c - b - a", "B. c - a - b", "C. a - c - b", "D. b - c - a"],
        answer: "B",
        level: "Nhận biết",
        explanation: "Hội thoại bắt đầu bằng lời chào và câu hỏi của Anna (c), tiếp theo Minh trả lời về kết quả của chị (a), cuối cùng Anna bày tỏ hy vọng chị đạt điểm số mong muốn (b). Trật tự đúng: c - a - b.",
        knowledgePoint: "Dialogue Arrangement Logic"
      },
      {
        id: 34,
        text: "Question 34:\na. Minh: That’s great to hear! What do you think he misses most from home?\nb. Lan: He has adapted well to the new environment and seems very happy.\nc. Minh: How has Manh been doing after two months in Taiwan?\nd. Minh: Have you spoken to him recently to check how he’s adjusting?\ne. Lan: I think he misses his family and the food from Vietnam.",
        options: ["A. d - b - a - e - c", "B. c - b - a - e - d", "C. d - e - a - b - c", "D. c - d - e - b - a"],
        answer: "B",
        level: "Thông hiểu",
        explanation: "Bắt đầu bằng câu hỏi thăm tổng quát của Minh (c), Lan phản hồi rằng Mạnh hòa nhập tốt (b), Minh khen và hỏi Mạnh nhớ gì nhất ở quê nhà (a), Lan trả lời nhớ gia đình và đồ ăn Việt Nam (e), kết thúc bằng câu hỏi d tiếp theo. Trật tự logic: c - b - a - e - d.",
        knowledgePoint: "Extended Dialogue Flow"
      },
      {
        id: 35,
        text: "Question 35:\nDear students,\na. As you may have heard, we will be switching to online classes for the next few weeks because of the severe storm.\nb. I hope everyone is doing well despite the weather conditions.\nc. I appreciate your understanding and flexibility during this time, and I’m confident we can make this work together.\nd. I know this might be an adjustment for some of you, but it’s important to prioritize safety.\ne. Please ensure you have access to your online resources, and let me know if you have any questions or concerns.\nBest wishes,\nMrs. Hanh",
        options: ["A. d - b - a - c - e", "B. c - b - e - a - d", "C. a - e - c - b - d", "D. b - a - d - c - e"],
        answer: "D",
        level: "Thông hiểu",
        explanation: "Bức thư của cô giáo bắt đầu bằng lời hỏi thăm sức khỏe (b), tiếp đó thông báo lý do chuyển sang học online (a), chia sẻ sự đồng cảm về việc phải thích nghi nhưng an toàn là trên hết (d), cảm ơn sự thấu hiểu (c), và dặn dò kiểm tra tài nguyên học liệu (e). Trật tự chuẩn: b - a - d - c - e.",
        knowledgePoint: "Formal Letter Arrangement"
      },
      {
        id: 36,
        text: "Question 36:\na. The quick and easy nature of platforms like TikTok and Instagram often leads to decreased attention spans, as viewers become accustomed to rapid changes and instant gratification.\nb. In conclusion, while short-form content can be entertaining and engaging, it is essential to be aware of its potential harms and to practice moderation in consumption to maintain a healthy balance in our lives.\nc. This type of media can also contribute to feelings of anxiety and inadequacy, as individuals may find themselves comparing their lives to the highlights showcased by others.\nd. In recent years, the rise of short-form content has become a significant trend, but its negative effects on viewers cannot be overlooked.\ne. Furthermore, the addictive nature of short-form content can lead to excessive screen time, negatively impacting physical health and social interactions.",
        options: ["A. b - a - c - d - e", "B. b - d - c - a - e", "C. d - a - c - e - b", "D. a - d - c - e - b"],
        answer: "C",
        level: "Vận dụng",
        explanation: "Đoạn văn mở đầu bằng câu chủ đề (Topic sentence) giới thiệu xu hướng và tác động tiêu cực của short-form content (d). Tiếp theo là tác hại thứ nhất về giảm khả năng chú ý (a), tác hại thứ hai về tâm lý lo âu khi so sánh bản thân (c), từ nối 'Furthermore' bổ sung tác hại nghiện màn hình (e), và câu kết đoạn bắt đầu bằng 'In conclusion' (b). Trật tự đúng: d - a - c - e - b.",
        knowledgePoint: "Academic Paragraph Coherence & Cohesion"
      }
    ],
    part2: {
      prompt: "2. Write an article (120-150 words) about advantages of living in a smart city (1.0 point)",
      wordLimit: "120 - 150 words",
      answer: `Living in a smart city brings numerous significant advantages that improve residents' quality of life. First and foremost, advanced infrastructure and intelligent transport systems greatly enhance convenience. With AI-controlled traffic lights and smart public transit, daily commuters experience fewer traffic jams and reduced travel times. Furthermore, smart cities are environmentally sustainable. Intelligent power grids and automated waste management systems optimize energy consumption and drastically cut down carbon emissions. In addition, public safety and healthcare are significantly bolstered through smart cameras, IoT sensors, and instant emergency response apps. Residents can access online public services and telemedicine within minutes, saving both time and financial resources. In conclusion, smart cities not only modernize daily living through technological advancements but also build a greener, safer, and more convenient environment for future generations.`,
      rubrics: [
        { criterion: "Task Achievement (Đáp ứng yêu cầu đề bài)", point: 0.4, desc: "Nêu rõ chủ đề, làm nổi bật được từ 2-3 lợi ích tiêu biểu của thành phố thông minh (giao thông, môi trường, an toàn), độ dài chuẩn 120-150 từ." },
        { criterion: "Organization & Coherence (Bố cục và tính mạch lạc)", point: 0.3, desc: "Bố cục 3 phần rõ ràng (Introduction, Body, Conclusion). Sử dụng hiệu quả các từ nối liên kết ý (First and foremost, Furthermore, In addition, In conclusion)." },
        { criterion: "Lexical Resource (Vốn từ vựng)", point: 0.15, desc: "Sử dụng chính xác và phong phú các thuật ngữ chuyên đề Unit 3 (smart city, intelligent transport, IoT sensors, carbon emissions, sustainable)." },
        { criterion: "Grammatical Accuracy (Độ chính xác ngữ pháp)", point: 0.15, desc: "Đúng cấu trúc câu phức, câu ghép, chia thì chính xác, không mắc lỗi chính tả hay dấu câu cơ bản." }
      ]
    }
  },

  speaking: {
    part1: {
      title: "Part 1: Introduce Yourself (0.5 point)",
      points: 0.5,
      criteria: [
        { name: "Greeting (Lời chào giáo viên đúng quy cách)", point: 0.1 },
        { name: "Name (Giới thiệu họ và tên)", point: 0.1 },
        { name: "Class (Giới thiệu lớp học)", point: 0.1 },
        { name: "School (Giới thiệu trường học)", point: 0.1 },
        { name: "Place of living (Giới thiệu nơi cư trú hiện tại)", point: 0.1 }
      ]
    },
    part2: {
      title: "Part 2: Topic Presentation (1.5 points)",
      points: 1.5,
      topics: [
        "Topic 1: Talk about your daily routines and healthy habits to live a long life (Unit 1)",
        "Topic 2: Discuss generational differences between Gen X and Gen Z in your family (Unit 2)",
        "Topic 3: Describe features of a smart city you would like to live in the future (Unit 3)",
        "Topic 4: Talk about a volunteer project to protect the environment or help disadvantaged youth (Unit 4)",
        "Topic 5: Suggest practical solutions to tackle global warming in your school (Unit 5)"
      ],
      rubrics: [
        { criterion: "Introduction (Mở bài dẫn dắt chủ đề rõ ràng)", point: 0.3 },
        { criterion: "Body (Phát triển 2-3 ý chính, từ vựng phong phú, nói lưu loát)", point: 0.9 },
        { criterion: "Conclusion (Kết luận tóm tắt, phát âm chuẩn, lời cảm ơn)", point: 0.3 }
      ]
    }
  }
};

// 2. ĐỀ CHUẨN THCS LỚP 7/8/9 THEO CÔNG VĂN 7991 (Ngữ liệu chuẩn 80-100 từ)
export const OFFICIAL_EXEMPLAR_THCS_8: OfficialExamData = {
  id: "thcs-8-official-7991",
  level: "THCS",
  grade: "8",
  examPeriod: "Cuối học kì I",
  schoolName: "",
  departmentName: "",
  examCode: "801",
  duration: 45,
  year: "2026 - 2027",
  ratio: { nb: 40, th: 30, vd: 30 },

  matrix: [
    {
      skill: "Listening",
      itemType: "1. Nghe chọn True/False (4 câu)\n2. Nghe chọn đáp án đúng A, B, C, D (4 câu)",
      mcq: { nb: 2, th: 2, vd: 0 },
      tf: { nb: 2, th: 2, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 8,
      totalPoints: 2.0,
      percentage: 20
    },
    {
      skill: "Language",
      itemType: "1. Phát âm và Trọng âm (4 câu)\n2. Trắc nghiệm từ vựng & ngữ pháp (6 câu)",
      mcq: { nb: 6, th: 3, vd: 1 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 10,
      totalPoints: 2.5,
      percentage: 25
    },
    {
      skill: "Reading",
      itemType: "1. Đọc điền từ vào chỗ trống 80-100 từ (5 câu)\n2. Đọc hiểu đoạn văn 80-100 từ (5 câu)",
      mcq: { nb: 4, th: 4, vd: 2 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 10,
      totalPoints: 2.5,
      percentage: 25
    },
    {
      skill: "Writing",
      itemType: "1. Tìm lỗi sai & Viết lại câu (Không có mức Nhận biết theo CV 7991 - 4 câu)\n2. Viết đoạn văn ngắn 60-80 từ (1 bài)",
      mcq: { nb: 0, th: 2, vd: 2 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 1, vd: 1 },
      essay: { nb: 0, th: 0, vd: 1 },
      totalQs: 5,
      totalPoints: 2.0,
      percentage: 20
    }
  ],

  spec: [
    {
      skill: "Listening",
      domain: "Kỹ năng nghe hiểu THCS (Đoạn nghe 85 từ về hoạt động thường ngày và sở thích)",
      outcomes: {
        nb: ["Nhận diện thời gian, phương tiện đi lại trong lời kể ngắn.", "Nhận diện món ăn và địa điểm đi chợ."],
        th: ["Hiểu nguyên nhân và cảm xúc nhân vật trong đoạn hội thoại."],
        vd: ["Không kiểm tra mức vận dụng ở phần nghe hiểu."]
      },
      questionRange: "Câu 1 - Câu 8",
      totalQs: 8
    },
    {
      skill: "Language",
      domain: "Kiến thức ngữ âm, từ vựng và ngữ pháp trọng tâm (Unit 1: Leisure Time -> Unit 5: Customs)",
      outcomes: {
        nb: [
          "Phát âm nguyên âm đơn/nguyên âm đôi (2 câu)",
          "Trọng âm từ 2 âm tiết (2 câu)",
          "Từ vựng chủ đề giải trí và lối sống nông thôn (2 câu)"
        ],
        th: [
          "Ngữ pháp: Verbs of liking + V-ing/to-inf (2 câu)",
          "Trạng từ so sánh hơn (Comparative adverbs) (1 câu)"
        ],
        vd: [
          "Sử dụng từ nối diễn đạt nguyên nhân kết quả trong câu phức (1 câu)"
        ]
      },
      questionRange: "Câu 9 - Câu 18",
      totalQs: 10
    },
    {
      skill: "Reading",
      domain: "Kỹ năng đọc hiểu văn bản ngắn 80 - 100 từ (Chủ đề Lối sống nông thôn & Đời sống thiếu niên)",
      outcomes: {
        nb: [
          "Điền từ loại cơ bản danh từ/động từ/tính từ (2 câu)",
          "Xác định thông tin chi tiết hiển ngôn trong đoạn văn (2 câu)"
        ],
        th: [
          "Điền liên từ kết nối câu (2 câu)",
          "Tìm đại từ quy chiếu và từ đồng nghĩa trong đoạn văn (2 câu)"
        ],
        vd: [
          "Suy luận cảm xúc hoặc ý chính của bài đọc (2 câu)"
        ]
      },
      questionRange: "Câu 19 - Câu 28",
      totalQs: 10
    },
    {
      skill: "Writing",
      domain: "Kỹ năng biến đổi câu và tạo lập đoạn văn ngắn (Quy chuẩn CV 7991: Không có mức Nhận biết)",
      outcomes: {
        nb: [],
        th: [
          "Phát hiện lỗi sai ngữ pháp cơ bản về thì hoặc dạng so sánh (1 câu)",
          "Viết lại câu sử dụng từ gợi ý giữ nguyên nghĩa (2 câu)"
        ],
        vd: [
          "Sắp xếp trật tự từ thành câu có nghĩa phức (1 câu)",
          "Viết đoạn văn ngắn 60 - 80 từ về hoạt động yêu thích vào thời gian rảnh rỗi (1 bài)"
        ]
      },
      questionRange: "Câu 29 - Câu 33",
      totalQs: 5
    }
  ],

  listening: {
    part1: {
      title: "Part 1: Listen to Nga talking about her leisure activities and choose True (T) or False (F) (1.0 point)",
      script: `Hi, I am Nga. In my free time, I love doing DIY projects with my sister. On Saturday mornings, we often collect old plastic bottles and cardboard boxes to make pen holders and small flower pots. It is very relaxing and good for the environment. Sometimes, my brother joins us to paint the finished items. In the afternoon, I prefer cycling around the quiet village park because it helps me stay healthy.`,
      questions: [
        { id: 1, text: "Question 1: Nga does DIY projects with her sister on Saturday mornings.", options: ["A. True", "B. False"], answer: "A", level: "Nhận biết", explanation: "Lời thoại: 'On Saturday mornings, we often collect old plastic bottles... to make pen holders' -> True." },
        { id: 2, text: "Question 2: They buy new plastic containers to decorate.", options: ["A. True", "B. False"], answer: "B", level: "Nhận biết", explanation: "Nga nói họ thu gom chai nhựa cũ 'collect old plastic bottles' chứ không mua mới -> False." },
        { id: 3, text: "Question 3: Nga's brother sometimes helps paint the finished items.", options: ["A. True", "B. False"], answer: "A", level: "Thông hiểu", explanation: "Lời thoại: 'Sometimes, my brother joins us to paint the finished items' -> True." },
        { id: 4, text: "Question 4: Nga prefers swimming in the afternoon.", options: ["A. True", "B. False"], answer: "B", level: "Thông hiểu", explanation: "Nga nói: 'In the afternoon, I prefer cycling around the quiet village park' (đạp xe chứ không phải bơi) -> False." }
      ]
    },
    part2: {
      title: "Part 2: Listen to Tom and Nam discussing life in the countryside and choose A, B, C or D (1.0 point)",
      script: `Tom: Nam, how was your trip to your grandparents' village last weekend?
Nam: It was wonderful! Life in the countryside is much more peaceful than in the city. The air is fresh and there is almost no traffic noise.
Tom: What did you do there?
Nam: I helped my grandfather herd cattle in the vast green pasture. I also flew kites with the local children near the river.
Tom: That sounds so exciting! Did you miss the Internet?
Nam: Not really. Staying away from computer screens made me feel completely relaxed.`,
      questions: [
        { id: 5, text: "Question 5: Where did Nam go last weekend?", options: ["A. To a busy city", "B. To his grandparents' village", "C. To an amusement park", "D. To the seaside"], answer: "B", level: "Nhận biết", explanation: "Lời thoại: 'trip to your grandparents' village last weekend' -> B." },
        { id: 6, text: "Question 6: What does Nam think of the countryside air?", options: ["A. It is polluted", "B. It is noisy", "C. It is fresh", "D. It is dusty"], answer: "C", level: "Nhận biết", explanation: "Nam nói: 'The air is fresh and there is almost no traffic noise' -> C." },
        { id: 7, text: "Question 7: What activity did Nam do with the local children?", options: ["A. Played video games", "B. Flew kites", "C. Read books", "D. Watched TV"], answer: "B", level: "Thông hiểu", explanation: "Nam nói: 'I also flew kites with the local children near the river' -> B." },
        { id: 8, text: "Question 8: How did Nam feel when staying away from computer screens?", options: ["A. Bored", "B. Anxious", "C. Completely relaxed", "D. Tired"], answer: "C", level: "Thông hiểu", explanation: "Nam nói: 'Staying away from computer screens made me feel completely relaxed' -> C." }
      ]
    }
  },

  language: {
    isModernFormat: false,
    phonetics: [
      { id: 9, text: "Question 9: Choose the word whose underlined part is pronounced differently from the others.", options: ["A. act<u>i</u>vity", "B. k<u>i</u>te", "C. v<u>i</u>llage", "D. c<u>i</u>ty"], answer: "B", level: "Nhận biết", explanation: "Đáp án B phần gạch chân phát âm là /aɪ/, các từ còn lại phát âm là /ɪ/." },
      { id: 10, text: "Question 10: Choose the word whose underlined part is pronounced differently from the others.", options: ["A. collect<u>ed</u>", "B. want<u>ed</u>", "C. decid<u>ed</u>", "D. play<u>ed</u>"], answer: "D", level: "Nhận biết", explanation: "'played' đuôi -ed phát âm là /d/, các từ còn lại phát âm là /ɪd/." },
      { id: 11, text: "Question 11: Choose the word that has a different stress pattern from the others.", options: ["A. cattle", "B. peaceful", "C. relax", "D. village"], answer: "C", level: "Nhận biết", explanation: "'relax' trọng âm rơi vào âm tiết thứ 2, các từ còn lại trọng âm rơi vào âm tiết thứ 1." },
      { id: 12, text: "Question 12: Choose the word that has a different stress pattern from the others.", options: ["A. tradition", "B. teenager", "C. countryside", "D. festival"], answer: "A", level: "Nhận biết", explanation: "'tradition' trọng âm rơi vào âm tiết thứ 2 (/trəˈdɪʃn/), các từ còn lại trọng âm 1." }
    ],
    grammarVocab: [
      { id: 13, text: "Question 13: My brother is hooked _______ playing online strategy games.", options: ["A. on", "B. in", "C. at", "D. with"], answer: "A", level: "Nhận biết", explanation: "Cụm tính từ cố định: 'be hooked on sth' nghĩa là say mê, nghiện điều gì." },
      { id: 14, text: "Question 14: People in the countryside usually live _______ than those in big cities.", options: ["A. happy", "B. more happily", "C. happier", "D. as happy"], answer: "B", level: "Thông hiểu", explanation: "Động từ thường 'live' cần so sánh hơn của trạng từ có đuôi -ly: 'more happily'." },
      { id: 15, text: "Question 15: During harvest time, farmers work _______ to collect ripe rice grains.", options: ["A. hardly", "B. harder", "C. hard", "D. hardest"], answer: "C", level: "Nhận biết", explanation: "'work hard' nghĩa là làm việc chăm chỉ, tích cực." },
      { id: 16, text: "Question 16: You should spend more time reading books _______ it broadens your general knowledge.", options: ["A. but", "B. although", "C. because", "D. so"], answer: "C", level: "Thông hiểu", explanation: "Liên từ 'because' chỉ nguyên nhân phù hợp ngữ cảnh." },
      { id: 17, text: "Question 17: Teenagers today are facing a lot of pressure from both schoolwork and _______ expectations.", options: ["A. parents'", "B. parent", "C. parents", "D. parent's"], answer: "A", level: "Thông hiểu", explanation: "Sở hữu cách của danh từ số nhiều kết thúc bằng 's': 'parents''." },
      { id: 18, text: "Question 18: Many ethnic minorities have their own unique customs, _______ they live harmoniously together.", options: ["A. yet", "B. so", "C. or", "D. for"], answer: "A", level: "Vận dụng", explanation: "Liên từ 'yet' mang nghĩa tương phản (tuy vậy, nhưng) thể hiện sự đoàn kết dù có nhiều tập tục riêng biệt." }
    ]
  },

  reading: {
    part1: {
      title: "1. Read the following passage (92 words) and choose the best answer for each blank (1.25 points)",
      passage: `Living in a rural village gives children many wonderful experiences that city life cannot provide. In the countryside, children can freely play in open fields without worrying about heavy traffic. They learn to appreciate nature by observing plants, helping with farm work, and (19) _______ domestic animals. Furthermore, the community bond is very strong; neighbours always know each other well and are willing to (20) _______ a hand. Although modern conveniences are (21) _______ than in urban areas, village life brings peace, fresh air, and valuable life (22) _______ to everyone (23) _______ lives there.`,
      questions: [
        { id: 19, text: "Question 19:", options: ["A. caring", "B. feeding", "C. eating", "D. holding"], answer: "B", level: "Nhận biết", explanation: "'feeding domestic animals' (cho vật nuôi ăn) là hoạt động nông nghiệp quen thuộc." },
        { id: 20, text: "Question 20:", options: ["A. lend", "B. take", "C. make", "D. do"], answer: "A", level: "Thông hiểu", explanation: "Thành ngữ 'lend a hand' nghĩa là giúp đỡ người khác." },
        { id: 21, text: "Question 21:", options: ["A. few", "B. fewer", "C. little", "D. less"], answer: "B", level: "Thông hiểu", explanation: "'conveniences' là danh từ đếm được số nhiều, so sánh hơn dùng 'fewer'." },
        { id: 22, text: "Question 22:", options: ["A. skills", "B. games", "C. toys", "D. tests"], answer: "A", level: "Nhận biết", explanation: "'life skills' (kỹ năng sống) là cụm danh từ thông dụng." },
        { id: 23, text: "Question 23:", options: ["A. which", "B. who", "C. whom", "D. whose"], answer: "B", level: "Nhận biết", explanation: "Đại từ quan hệ 'who' thay thế cho đại từ chỉ người 'everyone'." }
      ]
    },
    part2: {
      title: "2. Read the following text (95 words) and choose the correct answer A, B, C or D (1.25 points)",
      passage: `Origami, the traditional Japanese art of paper folding, has become a popular leisure activity among teenagers worldwide. It requires only a square sheet of paper and does not need any scissors or glue. By following step-by-step instructions patiently, practitioners can transform simple paper into intricate animals, flowers, and geometric models. Psychologists suggest that origami is beneficial for young people because it trains hand-eye coordination, develops spatial thinking, and enhances concentration. Moreover, completing a delicate paper model gives learners a profound sense of accomplishment, helping reduce daily stress and anxiety.`,
      questions: [
        { id: 24, text: "Question 24: What is the main subject of the passage?", options: ["A. Japanese history", "B. Paper manufacturing", "C. Origami as a hobby", "D. School examinations"], answer: "C", level: "Thông hiểu", explanation: "Bài văn nói về nghệ thuật gấp giấy Origami như một thú vui giải trí của giới trẻ." },
        { id: 25, text: "Question 25: What tools are needed to do origami?", options: ["A. Scissors and glue", "B. Only a square sheet of paper", "C. Paints and brushes", "D. Rulers and pencils"], answer: "B", level: "Nhận biết", explanation: "Dẫn chứng: 'It requires only a square sheet of paper and does not need any scissors or glue.'" },
        { id: 26, text: "Question 26: The word 'delicate' in the text is closest in meaning to _______.", options: ["A. heavy", "B. fine and detailed", "C. clumsy", "D. rough"], answer: "B", level: "Thông hiểu", explanation: "'delicate' nghĩa là tinh xảo, tỉ mỉ ('fine and detailed')." },
        { id: 27, text: "Question 27: According to psychologists, what is a benefit of origami?", options: ["A. Improving eyesight", "B. Developing spatial thinking", "C. Gaining physical strength", "D. Making money"], answer: "B", level: "Nhận biết", explanation: "Dẫn chứng: '...trains hand-eye coordination, develops spatial thinking, and enhances concentration.'" },
        { id: 28, text: "Question 28: How does completing a paper model make learners feel?", options: ["A. Disappointed", "B. Proud and relaxed", "C. Exhausted", "D. Lonely"], answer: "B", level: "Vận dụng", explanation: "Dẫn chứng: 'gives learners a profound sense of accomplishment, helping reduce daily stress' -> tự hào và thư giãn (Proud and relaxed)." }
      ]
    }
  },

  writing: {
    part1: [
      {
        id: 29,
        text: "Question 29: Find and correct the mistake in the sentence:\n'Although he was tired, but he still finished his homework before midnight.'",
        options: ["A. Although", "B. was", "C. but", "D. finished"],
        answer: "C",
        level: "Thông hiểu",
        explanation: "Trong tiếng Anh, đã có liên từ 'Although' thì không dùng 'but' trong cùng một câu ghép. Cần bỏ 'but'.",
        knowledgePoint: "Concession Clauses Error"
      },
      {
        id: 30,
        text: "Question 30: Rewrite the sentence so that it means the same as the first one:\n'Nam prefers playing badminton to swimming in the lake.'",
        options: [
          "A. Nam likes playing badminton better than swimming in the lake.",
          "B. Nam likes swimming in the lake more than badminton.",
          "C. Nam would rather playing badminton than swim.",
          "D. Nam enjoys swim more than play badminton."
        ],
        answer: "A",
        level: "Thông hiểu",
        explanation: "Cấu trúc tương đương: 'prefer V-ing to V-ing' = 'like V-ing better than V-ing'.",
        knowledgePoint: "Preference Structures"
      },
      {
        id: 31,
        text: "Question 31: Rewrite the sentence using the suggested words:\n'No one in my class can run faster than Phong.'\n→ Phong runs .......................................................................",
        answer: "Phong runs fastest in my class. (or Phong runs the fastest in my class.)",
        level: "Vận dụng",
        explanation: "Chuyển từ so sánh hơn phủ định ('No one runs faster') sang so sánh nhất ('Phong runs (the) fastest in my class').",
        knowledgePoint: "Superlative Adverb Transformation"
      },
      {
        id: 32,
        text: "Question 32: Rearrange the words to make a complete meaningful sentence:\n'spend / teenagers / hours / on / social media / many / shouldn't / every day / .'",
        answer: "Teenagers shouldn't spend many hours on social media every day.",
        level: "Vận dụng",
        explanation: "Trật tự câu: S (Teenagers) + modal (shouldn't spend) + O (many hours) + Prep (on social media) + Time (every day).",
        knowledgePoint: "Sentence Word Order"
      }
    ],
    part2: {
      prompt: "Question 33: Write a short paragraph (60-80 words) about your favourite leisure activity (1.0 point)",
      wordLimit: "60 - 80 words",
      answer: `My favourite leisure activity is reading science books in my free time. I usually read for about thirty minutes every evening before going to bed. Reading is truly fantastic because it helps me discover amazing facts about our universe and natural ecosystems. Furthermore, it improves my concentration and expands my English vocabulary. Whenever I feel stressed after hard school exams, immersing myself in an engaging book makes me feel completely peaceful and relaxed.`,
      rubrics: [
        { criterion: "Nội dung (Content)", point: 0.4, desc: "Giới thiệu rõ hoạt động giải trí yêu thích, nêu lý do và cảm xúc, độ dài chuẩn 60-80 từ." },
        { criterion: "Bố cục & Tính mạch lạc (Coherence)", point: 0.3, desc: "Có câu mở đoạn, các câu phát triển ý logic và câu kết đoạn trọn vẹn, sử dụng từ nối cơ bản." },
        { criterion: "Từ vựng & Ngữ pháp (Language)", point: 0.3, desc: "Dùng đúng thì hiện tại đơn, cấu trúc diễn đạt sở thích (love/enjoy/helps me), không sai lỗi chính tả." }
      ]
    }
  }
};

// 3. ĐỀ CHUẨN TIỂU HỌC LỚP 4 THEO CHƯƠNG TRÌNH GDPT 2018 (GLOBAL SUCCESS)
export const OFFICIAL_EXEMPLAR_TIEU_HOC_4: OfficialExamData = {
  id: "tieu-hoc-4-official",
  level: "Tiểu học",
  grade: "4",
  examPeriod: "Cuối học kì I",
  schoolName: "",
  departmentName: "",
  examCode: "301",
  duration: 35,
  year: "2026 - 2027",
  ratio: { nb: 40, th: 30, vd: 30 },
  matrix: [
    {
      skill: "Listening",
      itemType: "Listen and tick / True or False",
      mcq: { nb: 2, th: 2, vd: 0 },
      tf: { nb: 2, th: 2, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 8,
      totalPoints: 2.5,
      percentage: 25
    },
    {
      skill: "Language Focus",
      itemType: "Phonics, Vocabulary & Sentence Patterns",
      mcq: { nb: 4, th: 4, vd: 0 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 8,
      totalPoints: 2.5,
      percentage: 25
    },
    {
      skill: "Reading",
      itemType: "Reading comprehension (40-60 words)",
      mcq: { nb: 2, th: 3, vd: 1 },
      tf: { nb: 2, th: 0, vd: 0 },
      short: { nb: 0, th: 0, vd: 0 },
      essay: { nb: 0, th: 0, vd: 0 },
      totalQs: 8,
      totalPoints: 2.5,
      percentage: 25
    },
    {
      skill: "Writing",
      itemType: "Unscramble letters & Reorder sentences",
      mcq: { nb: 0, th: 0, vd: 0 },
      tf: { nb: 0, th: 0, vd: 0 },
      short: { nb: 0, th: 4, vd: 0 },
      essay: { nb: 0, th: 0, vd: 4 },
      totalQs: 8,
      totalPoints: 2.5,
      percentage: 25
    }
  ],
  spec: [
    {
      skill: "Listening",
      domain: "Kỹ năng nghe hiểu Tiểu học (Đoạn hội thoại ngắn 40-50 từ về bản thân, bạn bè)",
      outcomes: {
        nb: ["Nghe và nhận ra tên người, thời gian hoặc môn học trong các câu đơn ngắn (2 câu)"],
        th: ["Nghe hiểu hội thoại ngắn để xác định thông tin Đúng/Sai hoặc chọn tranh đúng (2 câu)"],
        vd: ["Nghe hiểu tình huống quen thuộc và điền 1 từ đơn giản (số, thứ, đồ vật)"]
      },
      questionRange: "Từ câu 1 đến câu 8",
      totalQs: 8
    },
    {
      skill: "Language Focus",
      domain: "Ngữ âm & Từ vựng Tiểu học (Âm chữ cái, từ vựng theo chủ đề gia đình, trường học, sở thích)",
      outcomes: {
        nb: ["Nhận biết âm vần chữ cái đầu từ quen thuộc (/fr/, /tr/, /cl/) (2 câu)", "Nhận biết từ vựng tương ứng với hình ảnh minh họa (2 câu)"],
        th: ["Phân biệt từ khác loại (Odd one out) trong nhóm từ đã học (2 câu)", "Chọn từ thích hợp hoàn thành câu giao tiếp hàng ngày (2 câu)"],
        vd: []
      },
      questionRange: "Từ câu 9 đến câu 16",
      totalQs: 8
    },
    {
      skill: "Reading",
      domain: "Kỹ năng đọc hiểu Tiểu học (Đoạn văn ngắn 40-60 từ có từ vựng quen thuộc)",
      outcomes: {
        nb: ["Đọc câu đơn và nhận biết tranh tương ứng (2 câu)"],
        th: ["Đọc đoạn văn 50 từ và tìm thông tin chi tiết trả lời câu hỏi A, B, C (4 câu)"],
        vd: ["Hiểu ý chính và suy luận sở thích của nhân vật trong bài đọc (2 câu)"]
      },
      questionRange: "Từ câu 17 đến câu 24",
      totalQs: 8
    },
    {
      skill: "Writing",
      domain: "Kỹ năng viết câu đơn và từ vựng Tiểu học (Không có mức độ Nhận biết)",
      outcomes: {
        nb: [],
        th: ["Sắp xếp các chữ cái cho sẵn thành từ vựng đúng chính tả (4 câu)"],
        vd: ["Sắp xếp các từ cho sẵn thành câu hoàn chỉnh đúng trật tự từ (4 câu)"]
      },
      questionRange: "Từ câu 25 đến câu 32",
      totalQs: 8
    }
  ],
  listening: {
    part1: {
      title: "Part 1. Listen and tick (✓) True (T) or False (F). You will listen TWICE (1.25 points):",
      script: `Hello, my name is Tony. I am ten years old and I am from Sydney, Australia. Now I live in Ha Noi, Viet Nam with my parents. I study at Sunflower Primary School. At school, my favourite subject is English because it is very fun and useful. On Mondays and Wednesdays, I have English lessons. In my free time, I love playing football with my classmates in the school yard.`,
      questions: [
        {
          id: 1,
          text: "Question 1: Tony is nine years old.",
          options: ["A. True", "B. False"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Trong bài nghe Tony nói: 'I am ten years old', do đó câu nói Tony 9 tuổi là False.",
          evidence: "Tony: 'I am ten years old...'",
          knowledgePoint: "Listening for age"
        },
        {
          id: 2,
          text: "Question 2: Tony comes from Australia.",
          options: ["A. True", "B. False"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Trong bài nghe Tony nói: 'I am from Sydney, Australia', do đó đáp án là True.",
          evidence: "Tony: 'I am from Sydney, Australia.'",
          knowledgePoint: "Listening for country"
        },
        {
          id: 3,
          text: "Question 3: Tony's favourite subject at school is Maths.",
          options: ["A. True", "B. False"],
          answer: "B",
          level: "Thông hiểu",
          explanation: "Tony nói môn học yêu thích là tiếng Anh: 'my favourite subject is English', do đó môn Maths là False.",
          evidence: "Tony: 'At school, my favourite subject is English...'",
          knowledgePoint: "Listening for favourite subject"
        },
        {
          id: 4,
          text: "Question 4: He plays football with his classmates in his free time.",
          options: ["A. True", "B. False"],
          answer: "A",
          level: "Thông hiểu",
          explanation: "Tony nói: 'In my free time, I love playing football with my classmates', do đó câu này là True.",
          evidence: "Tony: 'I love playing football with my classmates...'",
          knowledgePoint: "Listening for free time activities"
        }
      ]
    },
    part2: {
      title: "Part 2. Listen and circle the correct answer A, B, or C. You will listen TWICE (1.25 points):",
      script: `Hi, I am Linh. Today is Tuesday. I get up at six o'clock in the morning. I have a sandwich and milk for breakfast. At eight o'clock, I go to school. Today I have four subjects: Maths, Vietnamese, Music and Science. My favourite subject is Music because I love singing English songs. In the afternoon, I ride a bike with my sister in the park.`,
      questions: [
        {
          id: 5,
          text: "Question 5: What time does Linh get up in the morning?",
          options: ["A. At 5:30", "B. At 6:00", "C. At 6:30"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Linh nói: 'I get up at six o'clock in the morning'.",
          evidence: "Linh: 'I get up at six o'clock in the morning.'",
          knowledgePoint: "Listening for time"
        },
        {
          id: 6,
          text: "Question 6: What does Linh have for breakfast?",
          options: ["A. Bread and eggs", "B. Noodles and orange juice", "C. A sandwich and milk"],
          answer: "C",
          level: "Nhận biết",
          explanation: "Linh nói: 'I have a sandwich and milk for breakfast'.",
          evidence: "Linh: 'I have a sandwich and milk for breakfast.'",
          knowledgePoint: "Listening for meals"
        },
        {
          id: 7,
          text: "Question 7: Why does Linh like Music?",
          options: ["A. Because she loves singing songs", "B. Because she plays the piano", "C. Because her teacher is nice"],
          answer: "A",
          level: "Thông hiểu",
          explanation: "Linh nói: 'My favourite subject is Music because I love singing English songs'.",
          evidence: "Linh: 'because I love singing English songs.'",
          knowledgePoint: "Listening for reasons"
        },
        {
          id: 8,
          text: "Question 8: What does Linh do in the afternoon?",
          options: ["A. She swims in the pool", "B. She rides a bike in the park", "C. She plays badminton at school"],
          answer: "B",
          level: "Thông hiểu",
          explanation: "Linh nói: 'In the afternoon, I ride a bike with my sister in the park'.",
          evidence: "Linh: 'I ride a bike with my sister in the park.'",
          knowledgePoint: "Listening for outdoor activities"
        }
      ]
    }
  },
  language: {
    phonetics: [
      {
        id: 9,
        text: "Question 9: Circle the word that has the underlined sound pronounced differently:",
        options: ["A. cat", "B. cake", "C. apple", "D. bag"],
        answer: "B",
        level: "Nhận biết",
        explanation: "Phần gạch chân âm 'a': 'cake' phát âm là /eɪ/, các từ còn lại phát âm là /æ/.",
        knowledgePoint: "Phonics letter a"
      },
      {
        id: 10,
        text: "Question 10: Which word begins with the sound /fr/?",
        options: ["A. train", "B. friend", "C. clock", "D. play"],
        answer: "B",
        level: "Nhận biết",
        explanation: "'friend' bắt đầu bằng cụm phụ âm /fr/.",
        knowledgePoint: "Consonant blend /fr/"
      },
      {
        id: 11,
        text: "Question 11: Circle the odd one out (Chọn từ khác loại):",
        options: ["A. Monday", "B. Tuesday", "C. Morning", "D. Friday"],
        answer: "C",
        level: "Thông hiểu",
        explanation: "Monday, Tuesday, Friday là các thứ trong tuần; morning là buổi sáng trong ngày.",
        knowledgePoint: "Odd one out: Days of the week"
      },
      {
        id: 12,
        text: "Question 12: Circle the odd one out (Chọn từ khác loại):",
        options: ["A. English", "B. Science", "C. Teacher", "D. Maths"],
        answer: "C",
        level: "Thông hiểu",
        explanation: "English, Science, Maths là các môn học; Teacher là nghề nghiệp giáo viên.",
        knowledgePoint: "Odd one out: School subjects"
      }
    ],
    grammarVocab: [
      {
        id: 13,
        text: "Question 13: Where are you from? - I am from ______.",
        options: ["A. Vietnamese", "B. Viet Nam", "C. American", "D. English"],
        answer: "B",
        level: "Nhận biết",
        explanation: "Hỏi 'Where are you from?' trả lời tên quốc gia: 'Viet Nam' (không dùng quốc tịch).",
        knowledgePoint: "Asking about countries"
      },
      {
        id: 14,
        text: "Question 14: What can you do? - I can ______ a bike very well.",
        options: ["A. swim", "B. ride", "C. fly", "D. draw"],
        answer: "B",
        level: "Nhận biết",
        explanation: "Cụm từ đi với xe đạp: 'ride a bike'.",
        knowledgePoint: "Action verbs with vehicles"
      },
      {
        id: 15,
        text: "Question 15: When is your birthday? - It is ______ November.",
        options: ["A. on", "B. at", "C. in", "D. of"],
        answer: "C",
        level: "Thông hiểu",
        explanation: "Đi trước tháng trong năm dùng giới từ 'in' (in November).",
        knowledgePoint: "Prepositions of time with months"
      },
      {
        id: 16,
        text: "Question 16: What subjects do you have today? - I have Maths, Art ______ Music.",
        options: ["A. and", "B. but", "C. so", "D. because"],
        answer: "A",
        level: "Thông hiểu",
        explanation: "Dùng liên từ 'and' để nối các môn học liệt kê cùng nhau.",
        knowledgePoint: "Conjunction 'and'"
      }
    ]
  },
  reading: {
    part1: {
      title: "Part 1. Look at the pictures, read the sentences and circle True (T) or False (F) (1.25 points):",
      passage: `Look at the classroom activities:
1. Tom is reading a comic book at his desk.
2. Mai and Mary are playing badminton in the playground.
3. The teacher is writing on the blackboard.
4. There are three school bags on the table.`,
      questions: [
        {
          id: 17,
          text: "Question 17: Tom is reading a comic book.",
          options: ["A. True", "B. False"],
          answer: "A",
          level: "Nhận biết",
          explanation: "Câu 1 nêu rõ: 'Tom is reading a comic book at his desk', do đó True.",
          evidence: "Tom is reading a comic book...",
          knowledgePoint: "Reading comprehension: actions"
        },
        {
          id: 18,
          text: "Question 18: Mai and Mary are skipping in the classroom.",
          options: ["A. True", "B. False"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Bài đọc nêu: 'Mai and Mary are playing badminton in the playground', không phải skipping.",
          evidence: "Mai and Mary are playing badminton...",
          knowledgePoint: "Reading comprehension: sports"
        },
        {
          id: 19,
          text: "Question 19: The teacher is writing on the blackboard.",
          options: ["A. True", "B. False"],
          answer: "A",
          level: "Thông hiểu",
          explanation: "Khớp đúng thông tin số 3: 'The teacher is writing on the blackboard'.",
          evidence: "The teacher is writing on the blackboard.",
          knowledgePoint: "Reading comprehension: classroom"
        },
        {
          id: 20,
          text: "Question 20: There are four school bags on the table.",
          options: ["A. True", "B. False"],
          answer: "B",
          level: "Thông hiểu",
          explanation: "Bài nêu có 3 chiếc cặp ('three school bags'), không phải 4.",
          evidence: "There are three school bags on the table.",
          knowledgePoint: "Reading comprehension: numbers"
        }
      ]
    },
    part2: {
      title: "Part 2. Read the passage and choose the best answer A, B, or C (1.25 points):",
      passage: `My name is Nam. I am in Class 4A at Le Van Tam Primary School. Every day, my school starts at half past seven in the morning. We have five lessons every day. My favourite day of the week is Friday because I have English and Art. In the English class, we sing funny songs and play English word games with Miss Hoa. In the afternoon, I often go to the school library to read storybooks with my best friend, Phong.`,
      questions: [
        {
          id: 21,
          text: "Question 21: Which school does Nam go to?",
          options: ["A. Nguyen Du Primary School", "B. Le Van Tam Primary School", "C. Sunflower Primary School"],
          answer: "B",
          level: "Nhận biết",
          explanation: "Nam nói: 'I am in Class 4A at Le Van Tam Primary School'.",
          evidence: "Nam: 'I am in Class 4A at Le Van Tam Primary School.'",
          knowledgePoint: "Reading for school name"
        },
        {
          id: 22,
          text: "Question 22: What time does his school start in the morning?",
          options: ["A. At 7:00", "B. At 7:30", "C. At 8:00"],
          answer: "B",
          level: "Nhận biết",
          explanation: "'half past seven' tương đương với 7:30.",
          evidence: "Nam: 'my school starts at half past seven in the morning.'",
          knowledgePoint: "Reading for time expression"
        },
        {
          id: 23,
          text: "Question 23: Why is Friday his favourite day?",
          options: ["A. Because he has PE and Music", "B. Because he has English and Art", "C. Because he doesn't have homework"],
          answer: "B",
          level: "Thông hiểu",
          explanation: "Nam giải thích: 'My favourite day of the week is Friday because I have English and Art'.",
          evidence: "Nam: 'because I have English and Art.'",
          knowledgePoint: "Reading for reasons"
        },
        {
          id: 24,
          text: "Question 24: What do Nam and Phong do in the school library?",
          options: ["A. They read storybooks", "B. They play football", "C. They do homework together"],
          answer: "A",
          level: "Vận dụng",
          explanation: "Nam nói: 'I often go to the school library to read storybooks with my best friend, Phong'.",
          evidence: "Nam: 'to read storybooks with my best friend, Phong.'",
          knowledgePoint: "Reading for activities"
        }
      ]
    }
  },
  writing: {
    part1: [
      {
        id: 25,
        text: "Question 25: Reorder the letters to make a correct word:\n'e - h - l - l - o'  →  ........................................",
        answer: "hello",
        level: "Thông hiểu",
        explanation: "Các chữ cái sắp xếp lại thành từ 'hello'.",
        knowledgePoint: "Spelling: greetings"
      },
      {
        id: 26,
        text: "Question 26: Reorder the letters to make a correct word:\n's - c - h - o - o - l'  →  ........................................",
        answer: "school",
        level: "Thông hiểu",
        explanation: "Các chữ cái sắp xếp lại thành từ 'school'.",
        knowledgePoint: "Spelling: school"
      },
      {
        id: 27,
        text: "Question 27: Reorder the letters to make a correct word:\n'f - r - i - e - n - d'  →  ........................................",
        answer: "friend",
        level: "Thông hiểu",
        explanation: "Các chữ cái sắp xếp lại thành từ 'friend'.",
        knowledgePoint: "Spelling: friendship"
      },
      {
        id: 28,
        text: "Question 28: Reorder the letters to make a correct word:\n'b - i - r - t - h - d - a - y'  →  ........................................",
        answer: "birthday",
        level: "Thông hiểu",
        explanation: "Các chữ cái sắp xếp lại thành từ 'birthday'.",
        knowledgePoint: "Spelling: birthday"
      }
    ],
    part2: {
      prompt: "Question 29-32: Rearrange the words in the correct order to make meaningful sentences (1.25 points):",
      wordLimit: "Viết 4 câu đơn hoàn chỉnh",
      answer: `29. This is my new English teacher.
30. What time do you have breakfast?
31. I can play the piano very well.
32. My favourite subject at school is Science.`,
      rubrics: [
        { criterion: "Trật tự từ (Word Order)", point: 0.5, desc: "Sắp xếp đúng ngữ pháp câu đơn (Chủ ngữ + Động từ + Tân ngữ/Bổ ngữ)." },
        { criterion: "Viết hoa & Dấu câu (Capitalization & Punctuation)", point: 0.4, desc: "Đầu câu viết hoa, cuối câu có dấu chấm hoặc dấu chấm hỏi đúng loại câu." },
        { criterion: "Chính tả (Spelling)", point: 0.35, desc: "Chép lại đúng chính tả tất cả các từ, không thiếu hoặc thừa từ." }
      ]
    }
  },
  speaking: {
    part1: {
      title: "Part 1: Interview & Warm-up (1.0 point)",
      points: 1.0,
      criteria: [
        { name: "Phát âm rõ ràng (Pronunciation)", point: 0.4 },
        { name: "Phản xạ và trả lời đúng trọng tâm (Interaction)", point: 0.3 },
        { name: "Từ vựng và cấu trúc đơn giản (Vocabulary & Grammar)", point: 0.3 }
      ]
    },
    part2: {
      title: "Part 2: Look at the picture and describe / Topic speaking (1.5 points)",
      points: 1.5,
      topics: [
        "Topic 1: Talk about your school and your favourite subjects.",
        "Topic 2: Talk about your daily routines and what you can do."
      ],
      rubrics: [
        { criterion: "Nội dung miêu tả (Content)", point: 0.6 },
        { criterion: "Độ trôi chảy (Fluency)", point: 0.5 },
        { criterion: "Ngữ điệu tự nhiên (Intonation)", point: 0.4 }
      ]
    }
  }
};

