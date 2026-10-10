/**
 * Utility an toàn xử lý và tự động sửa chữa JSON trả về từ mô hình AI
 * Khắc phục hoàn toàn lỗi Unterminated string / Truncated JSON khi tạo đề thi dài
 */

export function safeParseJson<T = any>(jsonString: string): T | null {
  if (!jsonString || typeof jsonString !== 'string') return null;

  let s = jsonString.trim();

  // 1. Thử parse trực tiếp
  try {
    return JSON.parse(s);
  } catch {}

  // 2. Làm sạch markdown blocks nếu có
  if (s.startsWith('```json')) {
    s = s.slice(7);
  } else if (s.startsWith('```')) {
    s = s.slice(3);
  }
  if (s.endsWith('```')) {
    s = s.slice(0, -3);
  }
  s = s.trim();

  try {
    return JSON.parse(s);
  } catch {}

  // 3. Tự động sửa chữa JSON bị cắt cụt (Unterminated string & unclosed brackets)
  try {
    let inString = false;
    let isEscaped = false;
    const stack: string[] = [];

    for (let i = 0; i < s.length; i++) {
      const char = s[i];
      if (isEscaped) {
        isEscaped = false;
        continue;
      }
      if (char === '\\') {
        if (inString) isEscaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char);
        } else if (char === '}' || char === ']') {
          if (stack.length > 0) stack.pop();
        }
      }
    }

    // Nếu bị đứt gãy giữa chuỗi string
    if (inString) {
      if (s.endsWith('\\')) {
        s = s.slice(0, -1);
      }
      s += '"';
    }

    // Đóng các dấu ngoặc còn thiếu theo thứ tự LIFO
    while (stack.length > 0) {
      const top = stack.pop();
      if (top === '{') s += '}';
      else if (top === '[') s += ']';
    }

    // Dọn dẹp dấu phẩy thừa trước ngoặc đóng (vd: `,}` hoặc `,]`)
    s = s.replace(/,\s*([}\]])/g, '$1');

    return JSON.parse(s);
  } catch (err) {
    console.warn("safeParseJson: Không thể tự động phục hồi JSON, thử regex trích xuất:", err);
  }

  // 4. Nếu vẫn lỗi, thử tìm block json hoàn chỉnh lớn nhất
  try {
    const firstBrace = s.indexOf('{');
    const lastBrace = s.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const trimmedBlock = s.substring(firstBrace, lastBrace + 1).replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(trimmedBlock);
    }
  } catch {}

  return null;
}
