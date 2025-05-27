import React, { useEffect, useState } from 'react';
import MapDisplay, { generateMockRoute } from './MapDisplay';
import { connectWebSocket, sendWebSocketMessage, WebSocketMessage } from '../../utils/websocket';
import { showNotification, generateExampleNotifications } from '../../utils/notifications';
import ConfirmationModal from './ConfirmationModal';
import { MapPin, Clock, Wifi, WifiOff, RefreshCw, Bell, UserCheck } from 'lucide-react';

interface LiveTripDemoProps {
  tripId?: string;
}

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

interface VehicleLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

const LiveTripDemo: React.FC<LiveTripDemoProps> = ({ tripId = 'demo-trip-1' }) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [vehicleLocation, setVehicleLocation] = useState<VehicleLocation | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    onConfirm: () => {}
  });
  
  // Demo route (New York area)
  const startLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'Downtown Station'
  };
  
  const endLocation: Location = {
    latitude: 40.7484,
    longitude: -73.9857,
    name: 'Midtown Terminal'
  };
  
  const mockRoute = generateMockRoute(startLocation, endLocation, 12);
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Show some example notifications
    generateExampleNotifications(3);
    
    // Show a welcome notification
    showNotification(
      'Live Trip Demo Active',
      {
        body: 'You can now see real-time updates from your trip',
        icon: '/favicon.ico'
      },
      () => console.log('Notification clicked')
    );
    
    // Connect to mock WebSocket
    const onOpen = () => {
      setConnected(true);
      console.log('Connected to WebSocket');
    };
    
    const onMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket message received:', message);
        
        // Add to message list
        setMessages(prev => [message, ...prev].slice(0, 10));
        
        // Handle different message types
        if (message.type === 'VEHICLE_LOCATION') {
          setVehicleLocation(message.payload.location);
          
          // Show notification for vehicle updates occasionally
          if (Math.random() > 0.7) {
            showNotification(
              'Vehicle Location Updated',
              { body: `Vehicle is now at: ${message.payload.location.latitude.toFixed(4)}, ${message.payload.location.longitude.toFixed(4)}` }
            );
          }
        } else if (message.type === 'TRIP_UPDATE') {
          showNotification(
            'Trip Status Update',
            { body: `Trip status: ${message.payload.status}` }
          );
        } else if (message.type === 'BOOKING_CONFIRMATION') {
          showNotification(
            'Booking Confirmed!',
            { body: message.payload.message }
          );
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };
    
    const onError = (error: Event) => {
      console.error('WebSocket error:', error);
    };
    
    const onClose = (event: CloseEvent) => {
      setConnected(false);
      console.log('WebSocket disconnected:', event);
    };
    
    const socket = connectWebSocket(onOpen, onMessage as any, onError, onClose as any);
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
  
  // Toggle live tracking
  const toggleLiveTracking = () => {
    if (!isLiveTracking) {
      setIsLiveTracking(true);
    } else {
      setShowConfirmation(true);
      setConfirmationData({
        title: 'Stop Live Tracking',
        message: 'Are you sure you want to stop tracking this trip? You may miss important updates.',
        type: 'warning',
        onConfirm: () => {
          setIsLiveTracking(false);
          showNotification(
            'Live Tracking Disabled',
            { body: 'You have disabled live tracking for this trip' }
          );
        }
      });
    }
  };
  
  // Request location update
  const requestLocationUpdate = () => {
    sendWebSocketMessage({
      type: 'REQUEST_VEHICLE_LOCATION',
      tripId,
      vehicleId: 'v1'
    });
    
    showNotification(
      'Location Update Requested',
      { body: 'The driver has been asked to share their current location' }
    );
  };
  
  // Simulate booking confirmation
  const simulateBooking = () => {
    setShowConfirmation(true);
    setConfirmationData({
      title: 'Confirm Booking',
      message: 'Would you like to confirm your booking for this trip? Your payment method on file will be charged.',
      type: 'info',
      onConfirm: () => {
        sendWebSocketMessage({
          type: 'BOOKING_REQUEST',
          tripId,
          userId: 'user-1',
          seats: 1
        });
      }
    });
  };
  
  return (
    <div className="border rounded-lg bg-white dark:bg-primary-900/20 dark:border-primary-800 shadow-md transition-all duration-200">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmationData.onConfirm}
        title={confirmationData.title}
        message={confirmationData.message}
        type={confirmationData.type}
      />
      
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white" id="live-trip-demo-title">Live Trip Demo</h2>
          <div className="flex items-center" role="status" aria-live="polite">
            <div 
              className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}
              aria-hidden="true"
            ></div>
            <span className="text-sm dark:text-primary-200">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-3/5">
            <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h3 className="text-lg font-medium mb-2 sm:mb-0 dark:text-white" id="trip-map-heading">Trip Map</h3>
              
              <div className="flex flex-wrap gap-1 sm:gap-2" role="toolbar" aria-label="Map controls">
                <button 
                  onClick={toggleLiveTracking}
                  className={`px-3 py-1.5 rounded text-sm font-medium flex items-center transition-colors duration-200 ${
                    isLiveTracking 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                  }`}
                  aria-label={isLiveTracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
                  aria-pressed={isLiveTracking}
                >
                  {isLiveTracking ? (
                    <>
                      <WifiOff className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Stop Tracking</span>
                      <span className="sm:hidden">Stop</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Live Tracking</span>
                      <span className="sm:hidden">Track</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={requestLocationUpdate}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded text-sm font-medium flex items-center transition-colors duration-200"
                  aria-label="Update Location"
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Update Location</span>
                  <span className="sm:hidden">Update</span>
                </button>
                
                <button 
                  onClick={simulateBooking}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded text-sm font-medium flex items-center transition-colors duration-200"
                  aria-label="Simulate Booking"
                >
                  <UserCheck className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Simulate Booking</span>
                  <span className="sm:hidden">Book</span>
                </button>
              </div>
            </div>
            
            <div className="rounded overflow-hidden border dark:border-primary-700" aria-labelledby="trip-map-heading">
              <MapDisplay 
                height="350px"
                pickupLocation={startLocation}
                dropoffLocation={endLocation}
                routeCoordinates={mockRoute}
                vehicleId="v1"
                tripId={tripId}
                enableLiveTracking={isLiveTracking}
              />
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
                <span className="truncate">From: {startLocation.name}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-red-500 mr-1" aria-hidden="true" />
                <span className="truncate">To: {endLocation.name}</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium dark:text-white" id="real-time-updates-heading">Real-time Updates</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                Live Feed
              </span>
            </div>
            
            <div 
              className="h-[350px] overflow-y-auto border dark:border-primary-700 rounded p-3 bg-gray-50 dark:bg-primary-900/10"
              aria-labelledby="real-time-updates-heading"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  <p className="italic">No messages yet.</p>
                  <p className="text-xs mt-1">Start tracking or update location to see messages.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className="mb-3 p-2 bg-white dark:bg-primary-800/30 rounded shadow-sm transition-all duration-200"
                    role="article"
                  >
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">{msg.type}</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm dark:text-primary-200">
                      {msg.type === 'VEHICLE_LOCATION' && (
                        <span>
                          Vehicle at: {msg.payload.location.latitude.toFixed(4)}, {msg.payload.location.longitude.toFixed(4)}
                        </span>
                      )}
                      {msg.type === 'TRIP_UPDATE' && (
                        <span>
                          Trip status changed to: <strong>{msg.payload.status}</strong>
                        </span>
                      )}
                      {msg.type === 'BOOKING_CONFIRMATION' && (
                        <span>
                          Booking confirmed! ID: {msg.payload.bookingId}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="mt-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-primary-900/20 rounded-b-lg border-t dark:border-primary-800"
        role="contentinfo"
      >
        <p className="text-xs">
          <strong>Note:</strong> This is a demonstration of real-time capabilities using mock data.
          In a production environment, this would connect to a real backend service.
        </p>
      </div>
    </div>
  );
};

export default LiveTripDemo;