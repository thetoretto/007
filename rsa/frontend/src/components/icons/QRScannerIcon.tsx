import React from 'react';

interface QRScannerIconProps {
  className?: string;
}

const QRScannerIcon: React.FC<QRScannerIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* QR Code Frame */}
      <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4z" />
      {/* Data Pattern */}
      <path d="M15 15h2v2h-2zM18 15h1v1h-1zM15 18h1v1h-1zM17 17h2v2h-2zM20 15h1v1h-1zM15 20h1v1h-1z" />
      {/* Scanner Line */}
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
};

export default QRScannerIcon;