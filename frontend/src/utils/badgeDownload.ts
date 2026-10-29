import { toPng } from 'html-to-image';

export interface CaptureResult {
  dataUrl: string;
  blob: Blob;
  file: File;
  filename: string;
}

/**
 * Check if the client is running on a mobile browser or in-app webview
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Capture an HTML element (Badge) to Ultra-HD PNG and Blob with complete iOS Safari & mobile support.
 */
export async function captureElementToBadge(
  element: HTMLElement,
  filenameBase: string = 'The_Tam_Soat'
): Promise<CaptureResult> {
  // 1. Ensure fonts & images are decoded
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      try {
        if (img.complete) return;
        if (img.decode) await img.decode();
      } catch (_) {}
    })
  );

  const rect = element.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);

  const options = {
    width,
    height,
    pixelRatio: 2.5, // 2.5x retina (~950px width): razor sharp and safe from mobile canvas memory limits
    skipFonts: true, // Crucial: prevents CORS SecurityError with Google Fonts on mobile Safari & WebViews
    cacheBust: false,
    backgroundColor: '#ffffff',
    style: {
      transform: 'none',
      transformOrigin: 'top left',
      margin: '0',
      width: `${width}px`,
      height: `${height}px`,
    }
  };

  // Warm-up call for Safari SVG foreignObject image decoding
  try {
    await toPng(element, options);
  } catch (_) {}
  await new Promise((r) => setTimeout(r, 120));

  // Actual capture
  const dataUrl = await toPng(element, options);

  // Convert to Blob safely
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const filename = `${filenameBase}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  return { dataUrl, blob, file, filename };
}

/**
 * Trigger download of blob/file on desktop or Android
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Robust handler to download or share the badge across mobile & desktop platforms
 */
export async function downloadOrShareBadge(
  element: HTMLElement,
  metadata: {
    fullName?: string;
    code?: string;
  },
  onOpenPreviewModal?: (dataUrl: string, blob: Blob) => void
): Promise<{ success: boolean; method: 'share' | 'download' | 'preview' | 'cancelled' }> {
  const code = metadata.code ? metadata.code.replace(/[^a-zA-Z0-9_-]/g, '_') : 'prostate';
  const filenameBase = `Badge_Screening_${code}`;

  const { dataUrl, blob, file, filename } = await captureElementToBadge(element, filenameBase);
  const isMobile = isMobileDevice();

  // Try Web Share API with files if supported (standard on iOS Safari 15+ and Chrome Android)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Thẻ Tầm Soát Ung Thư Tuyến Tiền Liệt',
        text: `Thẻ đăng ký - ${metadata.fullName || ''} (${metadata.code || ''})`
      });
      return { success: true, method: 'share' };
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        // User closed share dialog, still give them preview modal access if on mobile
        if (onOpenPreviewModal) onOpenPreviewModal(dataUrl, blob);
        return { success: false, method: 'cancelled' };
      }
      console.warn('Web Share failed, falling back to download/preview:', shareErr);
    }
  }

  // If on mobile or in-app browser (Zalo / FB) where programmatic <a download> is blocked:
  if (isMobile) {
    if (onOpenPreviewModal) {
      onOpenPreviewModal(dataUrl, blob);
    }
    try {
      triggerFileDownload(blob, filename);
    } catch (_) {}
    return { success: true, method: 'preview' };
  }

  // Desktop: standard download
  triggerFileDownload(blob, filename);
  return { success: true, method: 'download' };
}
