/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from "@google/genai";

export const examSchema = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        level: { type: Type.STRING }, // 'THCS' | 'THPT'
        grade: { type: Type.STRING },
        examPeriod: { type: Type.STRING },
        duration: { type: Type.NUMBER },
        schoolName: { type: Type.STRING },
        departmentName: { type: Type.STRING },
        examCode: { type: Type.STRING }
      }
    },
    matrix: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          itemType: { type: Type.STRING },
          mcq: {
            type: Type.OBJECT,
            properties: {
              nb: { type: Type.NUMBER },
              th: { type: Type.NUMBER },
              vd: { type: Type.NUMBER }
            }
          },
          tf: {
            type: Type.OBJECT,
            properties: {
              nb: { type: Type.NUMBER },
              th: { type: Type.NUMBER },
              vd: { type: Type.NUMBER }
            }
          },
          short: {
            type: Type.OBJECT,
            properties: {
              nb: { type: Type.NUMBER },
              th: { type: Type.NUMBER },
              vd: { type: Type.NUMBER }
            }
          },
          essay: {
            type: Type.OBJECT,
            properties: {
              nb: { type: Type.NUMBER },
              th: { type: Type.NUMBER },
              vd: { type: Type.NUMBER }
            }
          },
          totalQs: { type: Type.NUMBER },
          totalPoints: { type: Type.NUMBER },
          percentage: { type: Type.NUMBER }
        }
      }
    },
    spec: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          domain: { type: Type.STRING },
          outcomes: {
            type: Type.OBJECT,
            properties: {
              nb: { type: Type.ARRAY, items: { type: Type.STRING } },
              th: { type: Type.ARRAY, items: { type: Type.STRING } },
              vd: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          questionRange: { type: Type.STRING },
          totalQs: { type: Type.NUMBER }
        }
      }
    },
    listening: {
      type: Type.OBJECT,
      properties: {
        part1: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            script: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  level: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  evidence: { type: Type.STRING }
                }
              }
            }
          }
        },
        part2: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            script: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  level: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  evidence: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    },
    language: {
      type: Type.OBJECT,
      properties: {
        isModernFormat: { type: Type.BOOLEAN },
        // For THPT (2 advertisements/announcements with 6 questions each)
        text1: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            passage: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  level: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  knowledgePoint: { type: Type.STRING }
                }
              }
            }
          }
        },
        text2: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            passage: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  level: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  knowledgePoint: { type: Type.STRING }
                }
              }
            }
          }
        },
        // For THCS (Phonetics & Vocab/Grammar)
        phonetics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              level: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        },
        grammarVocab: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              level: { type: Type.STRING },
              explanation: { type: Type.STRING },
              knowledgePoint: { type: Type.STRING }
            }
          }
        }
      }
    },
    reading: {
      type: Type.OBJECT,
      properties: {
        part1: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            passage: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  level: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  knowledgePoint: { type: Type.STRING }
                }
              }
            }
          }
        },
        part2: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            passage: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  level: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  evidence: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    },
    writing: {
      type: Type.OBJECT,
      properties: {
        part1: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              level: { type: Type.STRING },
              explanation: { type: Type.STRING },
              knowledgePoint: { type: Type.STRING }
            }
          }
        },
        part2: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            wordLimit: { type: Type.STRING },
            answer: { type: Type.STRING },
            rubrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  point: { type: Type.NUMBER },
                  desc: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    },
    speaking: {
      type: Type.OBJECT,
      properties: {
        part1: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            points: { type: Type.NUMBER },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  point: { type: Type.NUMBER }
                }
              }
            }
          }
        },
        part2: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            points: { type: Type.NUMBER },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            rubrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  point: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    }
  }
};
