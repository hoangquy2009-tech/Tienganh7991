import { saveAs } from 'file-saver';

/**
 * Utility an toàn cho việc tải file (Word .docx, Audio .wav)
 * Tương thích hoàn toàn với tất cả trình duyệt, môi trường Webview, Sandbox và Iframe
 */

/**
 * Chuẩn hóa tên file an toàn cho hệ điều hành (Windows, macOS, Linux, Android, iOS)
 */
export function sanitizeFilename(filename: string): string {
  // Loại bỏ các ký tự cấm trong tên file hệ điều hành: / \ : * ? " < > |
  const safe = filename.replace(/[/\\:*?"<>|]/g, '_').trim();
  return safe || 'Tai_Ve_Tap_Tin';
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const safeName = sanitizeFilename(filename);

  try {
    // 1. Phương pháp tiêu chuẩn: Sử dụng file-saver saveAs (được kiểm chứng đa nền tảng)
    saveAs(blob, safeName);
  } catch (saveAsErr) {
    console.warn("file-saver saveAs gặp sự cố, chuyển sang tạo link tải trực tiếp:", saveAsErr);

    try {
      // 2. Phương pháp fallback trực tiếp: Blob URL + Anchor Click
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.style.position = 'fixed';
      anchor.style.left = '-9999px';
      anchor.style.top = '-9999px';
      anchor.style.opacity = '0';
      anchor.href = blobUrl;
      anchor.download = safeName;
      anchor.setAttribute('download', safeName);
      anchor.rel = 'noopener';
      anchor.target = '_self';

      document.body.appendChild(anchor);
      anchor.click();

      setTimeout(() => {
        try {
          if (anchor.parentNode) {
            anchor.parentNode.removeChild(anchor);
          }
          window.URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 5000);
    } catch (primaryErr) {
      console.warn("Direct blob download failed, trying FileReader data URI:", primaryErr);

      // 3. Fallback cuối cùng: Chuyển sang data: URL qua FileReader
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const fallbackAnchor = document.createElement('a');
          fallbackAnchor.style.position = 'fixed';
          fallbackAnchor.style.left = '-9999px';
          fallbackAnchor.style.top = '-9999px';
          fallbackAnchor.style.opacity = '0';
          fallbackAnchor.href = dataUrl;
          fallbackAnchor.download = safeName;
          fallbackAnchor.setAttribute('download', safeName);
          fallbackAnchor.target = '_self';
          document.body.appendChild(fallbackAnchor);
          fallbackAnchor.click();

          setTimeout(() => {
            try {
              if (fallbackAnchor.parentNode) {
                fallbackAnchor.parentNode.removeChild(fallbackAnchor);
              }
            } catch {}
          }, 3000);
        };
        reader.readAsDataURL(blob);
      } catch (fallbackErr) {
        console.error("Critical download error:", fallbackErr);
        throw new Error(`Không thể tải file "${safeName}": Vui lòng kiểm tra quyền tải tệp của trình duyệt.`);
      }
    }
  }
}
