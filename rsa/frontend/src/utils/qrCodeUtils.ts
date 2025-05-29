/**
 * Utilities for handling QR code operations
 */

/**
 * Converts a React QR code component to a downloadable image
 * @param qrRef - Reference to the QR code DOM element
 * @param filename - Desired filename for the download
 */
export const downloadQRCodeAsImage = (qrElement: HTMLElement | null, filename: string = 'ticket-qr-code.png'): void => {
  if (!qrElement) return;
  
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Find the QR code SVG in the element
    const svgElement = qrElement.querySelector('svg');
    if (!svgElement) {
      throw new Error('QR code SVG not found');
    }
    
    // Get the dimensions
    const width = svgElement.width.baseVal.value;
    const height = svgElement.height.baseVal.value;
    
    // Set canvas dimensions
    canvas.width = width + 40; // Add padding
    canvas.height = height + 40;
    
    // Fill with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create image from SVG
    const img = new Image();
    img.onload = () => {
      // Draw image on canvas with padding
      context.drawImage(img, 20, 20, width, height);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    alert('Could not download QR code. Please try again.');
  }
};

/**
 * Creates a shareable URL with booking details
 * @param bookingDetails - The details of the booking
 * @returns A URL string
 */
export const createShareableBookingURL = (bookingDetails: {
  id: string;
  confirmationCode?: string;
  passengerName: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
}): string => {
  // Create a base URL for sharing (e.g., the booking view page)
  const baseUrl = `${window.location.origin}/booking/view`;
  
  // Create query parameters with booking details
  const params = new URLSearchParams({
    id: bookingDetails.id,
    code: bookingDetails.confirmationCode || '',
    passenger: bookingDetails.passengerName,
    from: bookingDetails.fromLocation,
    to: bookingDetails.toLocation,
    date: bookingDetails.date,
    time: bookingDetails.time
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generates a complete ticket as an image with booking details and QR code
 * @param bookingDetails - The complete booking details
 * @param qrElement - Reference to the QR code DOM element
 * @param filename - Desired filename for the download
 */
export const downloadCompleteTicket = async (
  bookingDetails: {
    confirmationCode?: string;
    fromLocation: string;
    toLocation: string;
    date: string;
    time: string;
    passengerName: string;
    seatNumber: string;
    seatType: string;
    paymentMethod: string;
    totalAmount: number;
    pickupPoint?: string;
  },
  qrElement: HTMLElement | null,
  filename: string = 'booking-ticket.png'
): Promise<void> => {
  if (!qrElement) return;
  
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Find the QR code SVG in the element
    const svgElement = qrElement.querySelector('svg');
    if (!svgElement) {
      throw new Error('QR code SVG not found');
    }
    
    // Dimensions for ticket
    const ticketWidth = 800; // Width should work well on mobile when saved
    const ticketHeight = 1200; // Sufficient height for all details
    
    // Set canvas dimensions
    canvas.width = ticketWidth;
    canvas.height = ticketHeight;
    
    // Fill with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    context.strokeStyle = '#F2C94C'; // Kente gold color
    context.lineWidth = 10;
    context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Load company logo if available
    const logoPromise = new Promise<HTMLImageElement | null>((resolve) => {
      try {
        const logo = new Image();
        logo.onload = () => resolve(logo);
        logo.onerror = () => resolve(null);
        logo.src = '/logo.png'; // Update with actual logo path
        
        // Set a timeout in case the logo can't be loaded
        setTimeout(() => resolve(null), 1000);
      } catch (e) {
        resolve(null);
      }
    });
    
    // Create image from SVG
    const qrImg = new Image();
    qrImg.src = svgUrl;
    
    // Wait for QR code image to load
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
    });
    
    // Get logo (or null if unavailable)
    const logo = await logoPromise;
    
    // Draw header
    context.fillStyle = '#F2C94C'; // Kente gold color
    context.fillRect(0, 0, canvas.width, 120);
    
    // Draw company name or logo
    context.fillStyle = 'black';
    context.font = 'bold 40px Arial';
    context.textAlign = 'center';
    
    if (logo) {
      // Draw logo if available
      context.drawImage(logo, canvas.width / 2 - 100, 20, 200, 80);
    } else {
      // Draw company name if logo not available
      context.fillText('Transport Booking', canvas.width / 2, 70);
    }
    
    // Draw ticket title
    context.fillStyle = 'black';
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.fillText('BOOKING CONFIRMATION', canvas.width / 2, 180);
    
    // Draw confirmation code
    if (bookingDetails.confirmationCode) {
      context.fillStyle = '#F2C94C';
      context.font = 'bold 28px Arial';
      context.fillText(`Confirmation: #${bookingDetails.confirmationCode}`, canvas.width / 2, 220);
    }
    
    // Draw QR code
    const qrSize = 200;
    context.drawImage(qrImg, canvas.width / 2 - qrSize / 2, 240, qrSize, qrSize);
    context.font = '16px Arial';
    context.fillStyle = '#555';
    context.fillText('Scan this code to verify ticket', canvas.width / 2, 460);
    
    // Draw divider
    context.strokeStyle = '#ddd';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(100, 500);
    context.lineTo(canvas.width - 100, 500);
    context.stroke();
    
    // Draw booking details
    context.textAlign = 'left';
    context.fillStyle = 'black';
    
    // Helper function to draw each detail
    const drawDetail = (label: string, value: string, y: number) => {
      context.font = '20px Arial';
      context.fillStyle = '#555';
      context.fillText(label, 100, y);
      
      context.font = 'bold 24px Arial';
      context.fillStyle = 'black';
      context.fillText(value, 100, y + 30);
    };
    
    // Draw journey details
    drawDetail('From:', bookingDetails.fromLocation, 550);
    drawDetail('To:', bookingDetails.toLocation, 620);
    drawDetail('Date:', bookingDetails.date, 690);
    drawDetail('Time:', bookingDetails.time, 760);
    drawDetail('Passenger:', bookingDetails.passengerName, 830);
    drawDetail('Seat:', `#${bookingDetails.seatNumber} (${bookingDetails.seatType})`, 900);
    
    if (bookingDetails.pickupPoint) {
      drawDetail('Pickup Point:', bookingDetails.pickupPoint, 970);
    }
    
    // Draw payment details
    context.strokeStyle = '#ddd';
    context.beginPath();
    context.moveTo(100, 1040);
    context.lineTo(canvas.width - 100, 1040);
    context.stroke();
    
    context.font = 'bold 20px Arial';
    context.fillStyle = 'black';
    context.fillText('Payment Method:', 100, 1080);
    context.fillText('Total Paid:', canvas.width - 300, 1080);
    
    context.font = '24px Arial';
    context.fillText(bookingDetails.paymentMethod, 100, 1110);
    context.fillStyle = '#F2C94C';
    context.font = 'bold 28px Arial';
    context.fillText(`$${bookingDetails.totalAmount.toFixed(2)}`, canvas.width - 300, 1110);
    
    // Add footer
    context.fillStyle = '#555';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText('Thank you for choosing our service!', canvas.width / 2, 1170);
    
    // Convert canvas to data URL and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(svgUrl);
    
  } catch (error) {
    console.error('Error downloading ticket:', error);
    alert('Could not download ticket. Please try again.');
  }
}; 