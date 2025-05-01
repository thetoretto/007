import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, XCircle } from 'lucide-react';
import useDriverStore from '../../store/driverStore';

const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { validateTicket } = useDriverStore();
  const scanIntervalRef = useRef<number | null>(null);

  // Track permission state more granularly
  const [permissionState, setPermissionState] = useState<'prompt' | 'denied' | 'dismissed' | 'granted'>('prompt');

  useEffect(() => {
    // Request camera permission and setup video stream
    const setupCamera = async () => {
      try {
        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            
            // Listen for permission changes
            permissionStatus.addEventListener('change', () => {
              if (permissionStatus.state === 'granted') {
                setPermissionState('granted');
                initializeCamera();
              } else if (permissionStatus.state === 'denied') {
                setPermissionState('denied');
                setHasPermission(false);
              }
            });
            
            // Initial state
            if (permissionStatus.state === 'granted') {
              setPermissionState('granted');
              await initializeCamera();
              return;
            } else if (permissionStatus.state === 'denied') {
              setPermissionState('denied');
              setHasPermission(false);
              return;
            }
          } catch (err) {
            // Fallback to getUserMedia if permissions API fails
            console.log('Permissions API not fully supported, falling back to getUserMedia');
          }
        }
        
        // Standard getUserMedia approach
        await initializeCamera();
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        
        // Handle specific error types
        if (error.name === 'NotAllowedError') {
          if (error.message.includes('Permission dismissed')) {
            setPermissionState('dismissed');
          } else {
            setPermissionState('denied');
          }
        }
        
        setHasPermission(false);
      }
    };
    
    // Function to initialize camera
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setPermissionState('granted');
          // Handle video play properly with Promise
          videoRef.current.onloadedmetadata = async () => {
            try {
              // Store the play promise
              const playPromise = videoRef.current?.play();
              
              // If play() returns a promise (modern browsers)
              if (playPromise !== undefined) {
                await playPromise;
                // Video playback started successfully
                startScanning();
              } else {
                // Older browsers might not return a promise
                startScanning();
              }
            } catch (error) {
              console.error('Error playing video:', error);
              // Try again after a short delay
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play()
                    .then(() => startScanning())
                    .catch(err => console.error('Retry play failed:', err));
                }
              }, 1000);
            }
          };
        }
      } catch (error) {
        throw error; // Let the outer catch handle this
      }
    };

    setupCamera();

    return () => {
      // Cleanup camera resources
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      setScanResult(null);
      setScanStatus('idle');
    };
  }, []);

  const startScanning = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Scan every 500ms
    scanIntervalRef.current = window.setInterval(() => {
      if (scanStatus !== 'idle') return; // Don't scan if we're showing a result
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Here we would normally process the image to detect QR codes
      // Since we can't use a QR code library, we'll simulate a scan for demo purposes
      simulateScan();
    }, 500);
  };

  // This function simulates a QR code scan for demonstration purposes
  // In a real implementation, you would use a QR code detection library
  const simulateScan = () => {
    // For demo purposes, we'll create a button to simulate a successful scan
    console.log('Scanning for QR codes...');
  };

  const handleManualScan = async () => {
    // Simulate a successful scan with a demo ticket ID
    const demoTicketId = 'TICKET-1234-ABCD';
    processScanResult(demoTicketId);
  };

  const processScanResult = async (data: string) => {
    if (data && scanStatus === 'idle') {
      try {
        setScanResult(data);
        // In a real app, this would validate the ticket with your backend
        const isValid = await validateTicket(data);
        setScanStatus(isValid ? 'success' : 'error');
        
        // Reset after 3 seconds
        setTimeout(() => {
          setScanResult(null);
          setScanStatus('idle');
        }, 3000);
      } catch (error) {
        setScanStatus('error');
        console.error('Error validating ticket:', error);
      }
    }
  };

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {permissionState === 'denied' ? 'Camera Access Denied' : 
             permissionState === 'dismissed' ? 'Camera Permission Dismissed' : 
             'Camera Permission Required'}
          </h2>
          <p className="text-gray-600 mb-6">
            {permissionState === 'denied' ? 
              'You have denied camera access. Please enable camera permissions in your browser settings to scan passenger tickets.' : 
             permissionState === 'dismissed' ? 
              'You dismissed the camera permission prompt. Please reload and allow camera access to scan tickets.' : 
              'Please allow camera access to scan passenger tickets.'}
          </p>
          
          {permissionState === 'denied' && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p className="text-sm">
                <strong>How to enable camera:</strong><br/>
                1. Click on the camera icon in your address bar<br/>
                2. Select "Allow" for camera access<br/>
                3. Refresh this page
              </p>
            </div>
          )}
          
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Go Back
            </button>
            
            {(permissionState === 'dismissed' || permissionState === 'denied') && (
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-800 text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="relative aspect-square max-w-lg mx-auto">
          {/* Video element to display camera feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Hidden canvas used for processing frames */}
          <canvas 
            ref={canvasRef} 
            className="hidden"
          />

          {/* Scanning overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-colors ${
              {
                idle: 'border-4 border-white',
                success: 'border-4 border-green-500',
                error: 'border-4 border-red-500'
              }[scanStatus]
            }`}
          >
            {scanStatus !== 'idle' && (
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                {scanStatus === 'success' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    <span>Valid Ticket</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-6 w-6 mr-2" />
                    <span>Invalid Ticket</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 text-center text-white">
          <p className="text-lg font-medium">Scan Passenger Ticket</p>
          <p className="text-sm text-gray-300 mt-1">
            Position the QR code within the frame
          </p>
          {/* Demo button to simulate a scan */}
          <button
            onClick={handleManualScan}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Simulate Scan (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;