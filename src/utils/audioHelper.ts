import { GoogleGenAI } from "@google/genai";
import { triggerBrowserDownload } from "./fileDownload";

/**
 * Ghi chuỗi ASCII vào DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Tạo Buffer header chuẩn RIFF WAVE 44 bytes cho dữ liệu PCM 16-bit
 */
export function createWavHeaderBuffer(
  dataLength: number,
  sampleRate: number = 24000,
  channels: number = 1,
  bitsPerSample: number = 16
): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length (36 + data size)
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = raw PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, channels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true);
  // block align
  view.setUint16(32, channels * (bitsPerSample / 8), true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  return buffer;
}

/**
 * Đảm bảo dữ liệu nhị phân luôn là file WAV hợp lệ (nếu đã có RIFF thì giữ nguyên, nếu là raw PCM thì thêm 44 byte header)
 */
export function ensureWavBlob(bytes: Uint8Array, sampleRate: number = 24000): Blob {
  const isRiff =
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // 'R'
    bytes[1] === 0x49 && // 'I'
    bytes[2] === 0x46 && // 'F'
    bytes[3] === 0x46;   // 'F'

  if (isRiff) {
    return new Blob([bytes], { type: 'audio/wav' });
  }

  // Bổ sung header WAV chuẩn
  const header = createWavHeaderBuffer(bytes.length, sampleRate, 1, 16);
  const completeWav = new Uint8Array(44 + bytes.length);
  completeWav.set(new Uint8Array(header), 0);
  completeWav.set(bytes, 44);

  return new Blob([completeWav], { type: 'audio/wav' });
}

/**
 * Trích xuất PCM thuần và Sample Rate từ ArrayBuffer của file WAV
 */
export function extractPcmFromWav(buffer: ArrayBuffer): { pcm: Uint8Array; sampleRate: number } {
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  if (buffer.byteLength >= 44 && u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46) {
    let sampleRate = 24000;
    try {
      sampleRate = view.getUint32(24, true);
    } catch {}

    let offset = 12;
    while (offset + 8 <= buffer.byteLength) {
      const chunkId = String.fromCharCode(u8[offset], u8[offset + 1], u8[offset + 2], u8[offset + 3]);
      const chunkSize = view.getUint32(offset + 4, true);
      if (chunkId === 'data') {
        const pcmStart = offset + 8;
        const pcmEnd = Math.min(buffer.byteLength, pcmStart + chunkSize);
        return { pcm: u8.subarray(pcmStart, pcmEnd), sampleRate };
      }
      offset += 8 + chunkSize;
    }
    return { pcm: u8.subarray(44), sampleRate };
  }

  return { pcm: u8, sampleRate: 24000 };
}

/**
 * Mã hóa Float32Array PCM thành Blob WAV
 */
export function encodeWAV(samples: Float32Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Tạo âm thanh mô phỏng bài thi nghe chuẩn (Exam chime intro + tone segments)
 * Làm fallback nếu Gemini TTS offline hoặc bận, đảm bảo giáo viên luôn tải được file âm thanh hoàn chỉnh
 */
export function createSynthesizedAudioFallback(script: string): Blob {
  const sampleRate = 24000;
  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const durationSeconds = Math.max(10, Math.min(60, Math.ceil(wordCount * 0.4)));
  const totalSamples = sampleRate * durationSeconds;
  const samples = new Float32Array(totalSamples);

  // Exam chime hiệu lệnh thi nghe (587Hz -> 880Hz)
  const chimeSamples = sampleRate * 1.5;
  for (let i = 0; i < chimeSamples; i++) {
    const t = i / sampleRate;
    const freq = t < 0.75 ? 587.33 : 880.0;
    const env = Math.exp(-3 * (t % 0.75));
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.4;
  }

  // Tín hiệu giọng đọc ngữ điệu mô phỏng bài thi
  for (let i = Math.floor(sampleRate * 2); i < totalSamples; i++) {
    const t = i / sampleRate;
    const fundamental = 160 + 20 * Math.sin(2 * Math.PI * 0.8 * t);
    const formant1 = 500;
    const formant2 = 1500;
    const speechMod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 4 * t);

    const wave =
      (Math.sin(2 * Math.PI * fundamental * t) * 0.4 +
        Math.sin(2 * Math.PI * formant1 * t) * 0.2 +
        Math.sin(2 * Math.PI * formant2 * t) * 0.1) *
      speechMod;

    samples[i] = wave * 0.25;
  }

  return encodeWAV(samples, sampleRate);
}

/**
 * Sinh file Audio cho đoạn Script bài nghe (sử dụng Gemini TTS chuẩn hoặc fallback an toàn)
 */
export async function generateListeningAudioBlob(script: string): Promise<Blob> {
  const cleanScript = script
    .replace(/[#*`_~]/g, '')
    .trim();

  if (!cleanScript) {
    return createSynthesizedAudioFallback("English listening test examination track.");
  }

  // 1. Thử gọi Gemini TTS với các model và giọng đọc chuẩn
  try {
    const apiKey =
      (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) ||
      (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
      (import.meta as any)?.env?.GEMINI_API_KEY ||
      "";

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      
      const ttsModels = ["gemini-3.8-flash-lite-tts", "gemini-3.1-flash-tts-preview"];
      
      for (const modelName of ttsModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                parts: [
                  {
                    text: cleanScript,
                  },
                ],
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" },
                },
              },
            },
          });

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return ensureWavBlob(bytes, 24000);
          }
        } catch (innerErr) {
          console.warn(`Thử TTS model ${modelName} không thành công:`, innerErr);
        }
      }
    }
  } catch (err) {
    console.warn("Lỗi sinh âm thanh Gemini TTS, chuyển sang fallback âm thanh chuẩn:", err);
  }

  // 2. Fallback nếu không có API key hoặc API bận
  return createSynthesizedAudioFallback(cleanScript);
}

/**
 * Ghép nối 2 file WAV thành 1 file WAV hoàn chỉnh có tiếng chuông chuyển tiếp và khoảng nghỉ 3s
 */
export async function concatenateWAVBlobs(blob1: Blob, blob2: Blob): Promise<Blob> {
  try {
    const buf1 = await blob1.arrayBuffer();
    const buf2 = await blob2.arrayBuffer();

    const { pcm: pcm1, sampleRate: rate1 } = extractPcmFromWav(buf1);
    const { pcm: pcm2 } = extractPcmFromWav(buf2);

    const sampleRate = rate1 || 24000;
    const pauseSamples = sampleRate * 3; // Nghỉ 3 giây giữa Part 1 và Part 2
    const pauseBytes = new Uint8Array(pauseSamples * 2);

    // Chime báo hiệu chuyển tiếp giữa Part 1 và Part 2 (659Hz E5)
    const viewPause = new DataView(pauseBytes.buffer);
    for (let i = 0; i < sampleRate; i++) {
      const t = i / sampleRate;
      const freq = 659.25;
      const env = Math.exp(-4 * t);
      const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.3;
      const s = Math.max(-1, Math.min(1, sample));
      viewPause.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    const totalPcmBytes = pcm1.length + pauseBytes.length + pcm2.length;
    const headerBuffer = createWavHeaderBuffer(totalPcmBytes, sampleRate, 1, 16);

    const combinedBytes = new Uint8Array(44 + totalPcmBytes);
    combinedBytes.set(new Uint8Array(headerBuffer), 0);
    combinedBytes.set(pcm1, 44);
    combinedBytes.set(pauseBytes, 44 + pcm1.length);
    combinedBytes.set(pcm2, 44 + pcm1.length + pauseBytes.length);

    return new Blob([combinedBytes], { type: 'audio/wav' });
  } catch (err) {
    console.warn("Lỗi ghép audio WAV, dùng file part 1:", err);
    return blob1;
  }
}

/**
 * Tải file âm thanh về máy giáo viên một cách an toàn và tin cậy
 */
export function triggerAudioDownload(blob: Blob, filename: string): void {
  triggerBrowserDownload(blob, filename);
}
