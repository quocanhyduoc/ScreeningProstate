/**
 * Production-grade date parsing and formatting utility.
 * Guarantees zero crashes on all browsers (including Safari iOS, older Android Chrome, and WebView).
 */
export function formatDate(dateVal: any, fallback = '--/--/----'): string {
  if (!dateVal) return fallback;

  try {
    let dateStr = String(dateVal).trim();
    
    // Safari iOS fix: Convert "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DDTHH:mm:ss"
    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    const d = new Date(dateStr);
    
    // Check if the parsed Date is valid
    if (isNaN(d.getTime())) {
      // If parsing failed but it looks like YYYY-MM-DD, try direct split formatting
      const ymdRegex = /^(\d{4})-(\d{2})-(\d{2})/;
      const match = dateStr.match(ymdRegex);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
      return fallback;
    }

    return d.toLocaleDateString('vi-VN');
  } catch (error) {
    console.error('Date parsing failed for value:', dateVal, error);
    return fallback;
  }
}
