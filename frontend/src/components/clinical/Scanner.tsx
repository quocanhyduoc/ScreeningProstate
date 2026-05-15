import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onScanFailure }) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 15, 
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.777778, // Match aspect-video (16:9)
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: true
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-3xl">
      <div id="reader" className="w-full h-full absolute inset-0" />
      <style jsx global>{`
        #reader { border: none !important; width: 100% !important; height: 100% !important; }
        #reader video { 
          object-fit: cover !important; 
          width: 100% !important; 
          height: 100% !important;
          border-radius: 24px !important;
        }
        #reader__dashboard_section_csr button {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 12px !important;
          padding: 10px 20px !important;
          font-weight: bold !important;
          border: none !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        #reader img { display: none !important; }
        #reader__status_span { color: white !important; font-size: 11px !important; font-weight: bold !important; }
        #reader__scan_region { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default Scanner;
