import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import SkeletonCard from '../../components/common/SkeletonCard';
import LiveTripDemo from '../../components/common/LiveTripDemo';
import MapDisplay, { generateMockRoute } from '../../components/common/MapDisplay';
import TripViewer from '../../components/common/TripViewer';
import SeatSelector from '../../components/common/SeatSelector';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import PaymentConfirmation from '../../components/common/PaymentConfirmation';
import TripActivityLog from '../../components/common/TripActivityLog';
import CustomSelect from '../../components/common/CustomSelect';
import ThemeToggle from '../../components/common/ThemeToggle';
import PricingCard, { PricingTier } from '../../components/common/PricingCard';
import { showNotification, getNotifications, markNotificationAsRead, clearAllNotifications, AppNotification, generateExampleNotifications } from '../../utils/notifications';
import { Bell, X, Check, Clock, Calendar, Map, Car, Search, ChevronsUpDown, Menu, ChevronDown, CreditCard, History, Palette } from 'lucide-react';

interface Seat {
  id: string;
  number: string;
  price: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status?: string;
}

interface Trip {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  price: number;
}

const DemoPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState<'liveTrip' | 'notifications' | 'map' | 'skeleton' | 'trips' | 'seats' | 'activity' | 'theme'>('liveTrip');
  const [showTabsMenu, setShowTabsMenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [confirmationData, setConfirmationData] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    onConfirm: () => {}
  });
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Generate example notifications
    generateExampleNotifications(5);
    
    // Update notifications state
    const updateNotifications = () => {
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    };
    
    // Initial update
    updateNotifications();
    
    // Set interval to periodically update notifications (simulating real-time)
    const interval = setInterval(() => {
      updateNotifications();
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  const handleReadNotification = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const handleClearAllNotifications = () => {
    setShowConfirmation(true);
    setConfirmationData({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => {
        clearAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
        setShowNotifications(false);
      }
    });
  };
  
  const handleCreateNotification = () => {
    const types = ['success', 'info', 'warning', 'error'];
    const type = types[Math.floor(Math.random() * types.length)] as 'success' | 'info' | 'warning' | 'error';
    
    showNotification(
      `Demo Notification (${type})`,
      { body: `This is a test notification of type ${type} created at ${new Date().toLocaleTimeString()}` }
    );
    
    // Update notifications after a short delay
    setTimeout(() => {
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    }, 500);
  };
  
  // For map demo
  const startLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'Downtown'
  };
  
  const endLocation = {
    latitude: 40.7484,
    longitude: -73.9857,
    name: 'Midtown'
  };
  
  const mockRoute = generateMockRoute(startLocation, endLocation, 8);

  const handleSeatSelection = (seats: Seat[]) => {
    setSelectedSeats(seats);
    
    if (seats.length > 0) {
      const totalPrice = seats.reduce((sum: number, seat: any) => sum + seat.price, 0);
      
      if (seats.length >= 2) {
        setShowConfirmation(true);
        setConfirmationData({
          title: 'Confirm Seat Selection',
          message: `You've selected ${seats.length} seats for a total of $${totalPrice.toFixed(2)}. Would you like to proceed to payment?`,
          type: 'success',
          onConfirm: () => {
            // Proceed to payment
            setShowPayment(true);
          }
        });
      }
    }
  };
  
  const handleTripSelection = (trip: Trip) => {
    setSelectedTrip(trip);
    
    setShowConfirmation(true);
    setConfirmationData({
      title: 'Trip Selected',
      message: `You've selected the ${trip.time} trip from ${trip.fromLocation} to ${trip.toLocation}. Would you like to proceed to payment?`,
      type: 'info',
      onConfirm: () => {
        // Proceed to payment
        setShowPayment(true);
      }
    });
  };
  
  const handlePaymentSuccess = () => {
    // Reset selected items after successful payment
    if (selectedSeats.length > 0) {
      showNotification(
        'Seats Booked Successfully',
        { body: `You've booked ${selectedSeats.length} seats for your trip.` }
      );
      setSelectedSeats([]);
    }
    
    if (selectedTrip) {
      showNotification(
        'Trip Booked Successfully',
        { body: `Your trip from ${selectedTrip.fromLocation} to ${selectedTrip.toLocation} has been booked.` }
      );
      setSelectedTrip(null);
    }
  };
  
  const handleAddPaymentMethod = () => {
    setShowConfirmation(true);
    setConfirmationData({
      title: 'Add Payment Method',
      message: 'This is a demo feature. In a real application, you would be directed to a secure form to add your payment details.',
      type: 'info',
      onConfirm: () => {
        showNotification(
          'Payment Method Added',
          { body: 'Demo payment method has been added to your account.' }
        );
      }
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Navbar />
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmationData.onConfirm}
        title={confirmationData.title}
        message={confirmationData.message}
        type={confirmationData.type}
      />
      
      {/* Payment Confirmation Modal */}
      <PaymentConfirmation 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onConfirm={handlePaymentSuccess}
        trip={selectedTrip}
        seats={selectedSeats}
        onAddPaymentMethod={handleAddPaymentMethod}
      />
      
      {/* Notifications bell */}
      <div className="fixed top-16 right-4 z-50">
        <button 
          className="relative p-2 bg-background-light dark:bg-section-dark rounded-full shadow-md"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-6 w-6 text-text-base dark:text-text-inverse" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-error text-text-inverse flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        
        {/* Notifications panel */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] max-h-[80vh] overflow-y-auto bg-background-light dark:bg-section-dark rounded-lg shadow-lg border border-gray-200 dark:border-primary-900">
            <div className="p-3 border-b border-gray-200 dark:border-primary-900 flex justify-between items-center">
              <h3 className="text-lg font-medium text-text-base dark:text-text-inverse">Notifications</h3>
              <button 
                onClick={handleClearAllNotifications}
                className="text-sm text-gray-500 hover:text-text-base dark:text-gray-400 dark:hover:text-text-inverse"
              >
                Clear All
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-gray-200 dark:border-primary-900 ${notification.read ? 'bg-background-light dark:bg-section-dark' : 'bg-primary-100 dark:bg-primary-900'} hover:bg-gray-50 dark:hover:bg-gray-800`}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-text-base dark:text-text-inverse">{notification.title}</h4>
                      <button 
                        onClick={() => handleReadNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        aria-label={notification.read ? "Mark as unread" : "Mark as read"}
                      >
                        {notification.read ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-text-base dark:text-gray-300 mt-1">{notification.body}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-3 border-t border-gray-200 dark:border-primary-900">
              <button 
                onClick={handleCreateNotification}
                className="w-full py-2 bg-primary hover:bg-primary-800 text-text-base dark:text-text-base rounded text-sm font-medium"
              >
                Create Test Notification
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Proceed to payment floating button (only visible when there are seats or trips selected) */}
      {(selectedSeats.length > 0 || selectedTrip) && !showPayment && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowPayment(true)}
            className="flex items-center px-4 py-2 bg-success hover:bg-primary-800 text-text-base dark:text-text-base rounded-full shadow-lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            <span>Proceed to Payment</span>
          </button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-accent-black dark:text-text-inverse">Feature Demo</h1>
          <p className="text-text-base dark:text-gray-300">This page demonstrates the new real-time features, map integration, and UI enhancements.</p>
        </div>
        
        {/* Mobile demo selector dropdown */}
        <div className="md:hidden mb-4">
          <button
            className="w-full flex items-center justify-between px-4 py-2 bg-background-light dark:bg-section-dark border border-gray-200 dark:border-primary-900 rounded-md shadow-sm"
            onClick={() => setShowTabsMenu(!showTabsMenu)}
          >
            <span className="font-medium text-text-base dark:text-text-inverse">
              {selectedDemo === 'liveTrip' && 'Live Trip'}
              {selectedDemo === 'map' && 'Map'}
              {selectedDemo === 'trips' && 'Trip Records'}
              {selectedDemo === 'seats' && 'Seat Selection'}
              {selectedDemo === 'notifications' && 'Notifications'}
              {selectedDemo === 'skeleton' && 'Skeleton Loading'}
              {selectedDemo === 'activity' && 'Trip Activity'}
              {selectedDemo === 'theme' && 'Theme Demo'}
            </span>
            <ChevronDown className={`h-5 w-5 text-text-base dark:text-text-inverse transition-transform ${showTabsMenu ? 'transform rotate-180' : ''}`} />
          </button>
          
          {showTabsMenu && (
            <div className="mt-1 bg-background-light dark:bg-section-dark border border-gray-200 dark:border-primary-900 rounded-md shadow-lg z-10 relative">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('liveTrip');
                  setShowTabsMenu(false);
                }}
              >
                <Clock className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Live Trip
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('map');
                  setShowTabsMenu(false);
                }}
              >
                <Map className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Map
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('trips');
                  setShowTabsMenu(false);
                }}
              >
                <Car className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Trip Records
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('activity');
                  setShowTabsMenu(false);
                }}
              >
                <History className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Trip Activity
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('seats');
                  setShowTabsMenu(false);
                }}
              >
                <ChevronsUpDown className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Seat Selection
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('notifications');
                  setShowTabsMenu(false);
                }}
              >
                <Bell className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Notifications
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('skeleton');
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 3000);
                  setShowTabsMenu(false);
                }}
              >
                <Calendar className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Skeleton Loading
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center text-text-base dark:text-text-inverse"
                onClick={() => {
                  setSelectedDemo('theme');
                  setShowTabsMenu(false);
                }}
              >
                <Palette className="h-4 w-4 mr-2 text-primary-800 dark:text-primary-200" />
                Theme Demo
              </button>
            </div>
          )}
        </div>
        
        {/* Desktop demo selector tabs */}
        <div className="hidden md:flex border-b border-gray-200 dark:border-primary-900 mb-6 overflow-x-auto">
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'liveTrip' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => setSelectedDemo('liveTrip')}
          >
            <Clock className="h-4 w-4 inline mr-1" />
            Live Trip
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'map' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => setSelectedDemo('map')}
          >
            <Map className="h-4 w-4 inline mr-1" />
            Map
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'trips' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => setSelectedDemo('trips')}
          >
            <Car className="h-4 w-4 inline mr-1" />
            Trip Records
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'activity' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => setSelectedDemo('activity')}
          >
            <History className="h-4 w-4 inline mr-1" />
            Trip Activity
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'seats' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => setSelectedDemo('seats')}
          >
            <ChevronsUpDown className="h-4 w-4 inline mr-1" />
            Seat Selection
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'notifications' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => setSelectedDemo('notifications')}
          >
            <Bell className="h-4 w-4 inline mr-1" />
            Notifications
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'skeleton' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => {
              setSelectedDemo('skeleton');
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 3000);
            }}
          >
            <Calendar className="h-4 w-4 inline mr-1" />
            Skeleton Loading
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              selectedDemo === 'theme' 
                ? 'text-primary-800 border-b-2 border-primary dark:text-text-accent dark:border-primary-200' 
                : 'text-text-base hover:text-primary-800 dark:text-gray-400 dark:hover:text-text-accent'
            }`}
            onClick={() => {
              setSelectedDemo('theme');
              setShowTabsMenu(false);
            }}
          >
            <Palette className="h-4 w-4 inline mr-1" />
            Theme Demo
          </button>
        </div>
        
        {/* Selected demo content */}
        {selectedDemo === 'liveTrip' && (
          <LiveTripDemo />
        )}
        
        {selectedDemo === 'trips' && (
          <TripViewer onTripSelect={handleTripSelection} />
        )}
        
        {selectedDemo === 'seats' && (
          <SeatSelector onSeatSelect={handleSeatSelection} />
        )}
        
        {selectedDemo === 'activity' && (
          <TripActivityLog />
        )}
        
        {selectedDemo === 'map' && (
          <div className="border border-gray-200 dark:border-primary-900 rounded-lg bg-background-light dark:bg-section-dark p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-accent-black dark:text-text-inverse">Map Integration</h2>
            <MapDisplay 
              height="400px"
              pickupLocation={startLocation}
              dropoffLocation={endLocation}
              routeCoordinates={mockRoute}
            />
          </div>
        )}
        
        {selectedDemo === 'notifications' && (
          <div className="border border-gray-200 dark:border-primary-900 rounded-lg bg-background-light dark:bg-section-dark p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-accent-black dark:text-text-inverse">Notifications System</h2>
            <p className="mb-4 text-text-base dark:text-gray-300">This demo showcases the real-time notification system. Click the button below to generate a random notification.</p>
            
            <button 
              onClick={handleCreateNotification}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-800 text-text-base dark:text-text-base rounded text-sm font-medium"
            >
              Create Test Notification
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-primary-900">
              <h3 className="font-medium mb-2 text-text-base dark:text-text-inverse">Recent Notifications</h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-primary-900 rounded p-2 bg-white dark:bg-background-dark">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-2 mb-2 rounded ${notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-primary-100 dark:bg-primary-900'}`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm text-text-base dark:text-text-inverse">{notification.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{notification.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-text-base dark:text-gray-300 mt-1">{notification.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {selectedDemo === 'skeleton' && (
          <div className="border border-gray-200 dark:border-primary-900 rounded-lg bg-background-light dark:bg-section-dark p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-accent-black dark:text-text-inverse">Skeleton Loading</h2>
            <p className="mb-4 text-text-base dark:text-gray-300">This demo showcases skeleton loading states for content that's still loading.</p>
            
            {isLoading ? (
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border border-gray-200 dark:border-primary-900 rounded p-4 bg-white dark:bg-background-dark">
                  <h3 className="font-medium mb-2 text-accent-black dark:text-text-inverse">Content Loaded</h3>
                  <p className="text-text-base dark:text-gray-300">This content has finished loading.</p>
                </div>
                <div className="border border-gray-200 dark:border-primary-900 rounded p-4 bg-white dark:bg-background-dark">
                  <h3 className="font-medium mb-2 text-accent-black dark:text-text-inverse">User Profile</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-text-base dark:text-text-inverse">John Doe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Premium Member</p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-primary-900 rounded p-4 bg-white dark:bg-background-dark">
                  <h3 className="font-medium mb-2 text-accent-black dark:text-text-inverse">Trip Status</h3>
                  <p className="text-success font-medium">On Time</p>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 3000);
              }}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-800 text-text-base dark:text-text-base rounded text-sm font-medium"
            >
              Reload Content
            </button>
          </div>
        )}
        
        {selectedDemo === 'theme' && (
          <div className="border border-gray-200 dark:border-primary-900 rounded-lg bg-background-light dark:bg-section-dark p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-accent-black dark:text-text-inverse">Theme Demo</h2>
            <p className="mb-6 text-text-base dark:text-gray-300">This demo showcases the African-inspired theme system with various UI components.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Color Palette Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-text-base dark:text-text-inverse border-b border-gray-200 dark:border-primary-800 pb-2">Color Palette</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Primary Colors</h4>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">100</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-300"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">300</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">500</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-700"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">700</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-900"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">900</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Accent Colors</h4>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-yellow"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Yellow</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-green"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Green</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-purple"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Purple</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-red"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Red</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-orange"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Orange</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Earth Tones</h4>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-earth-clay"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Clay</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-earth-ochre"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Ochre</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-earth-sienna"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Sienna</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-earth-sand"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Sand</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-earth-coffee"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Coffee</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Kente Colors</h4>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-kente-gold"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Gold</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-kente-green"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Green</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-kente-red"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Red</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-kente-blue"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Blue</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-accent-kente-black"></div>
                        <span className="text-xs mt-1 text-text-base dark:text-text-inverse">Black</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* UI Components Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-text-base dark:text-text-inverse border-b border-gray-200 dark:border-primary-800 pb-2">UI Components</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Theme Toggle</h4>
                    <div className="flex space-x-4">
                      <ThemeToggle size="sm" />
                      <ThemeToggle size="md" showLabel={true} />
                      <ThemeToggle size="lg" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Buttons</h4>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary">Primary</button>
                      <button className="btn btn-secondary">Secondary</button>
                      <button className="btn btn-accent">Accent</button>
                      <button className="btn btn-success">Success</button>
                      <button className="btn btn-danger">Danger</button>
                      <button className="btn btn-primary-outline">Outline</button>
                      <button className="btn btn-primary-ghost">Ghost</button>
                      <button className="btn btn-disabled" disabled>Disabled</button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Custom Select</h4>
                    <CustomSelect 
                      options={[
                        { value: 'option1', label: 'Accra' },
                        { value: 'option2', label: 'Lagos' },
                        { value: 'option3', label: 'Nairobi' },
                        { value: 'option4', label: 'Cairo' },
                        { value: 'option5', label: 'Cape Town' }
                      ]}
                      value="option1"
                      onChange={() => {}}
                      label="Select a City"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Form Controls</h4>
                    <div className="space-y-2">
                      <input type="text" placeholder="Text Input" className="input w-full" />
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="check1" className="form-checkbox" />
                        <label htmlFor="check1" className="text-text-base dark:text-text-inverse">Checkbox</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="radio1" name="radio" className="form-radio" />
                        <label htmlFor="radio1" className="text-text-base dark:text-text-inverse">Radio Button</label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-primary">Primary</span>
                      <span className="badge badge-success">Success</span>
                      <span className="badge badge-warning">Warning</span>
                      <span className="badge badge-error">Error</span>
                      <span className="badge badge-gray">Gray</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pricing Cards */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-text-base dark:text-text-inverse border-b border-gray-200 dark:border-primary-800 pb-2 mb-6">Pricing Cards</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <PricingCard
                  tier={{
                    title: 'Basic',
                    price: 9.99,
                    period: 'month',
                    description: 'Perfect for occasional travelers',
                    features: [
                      { text: '10 rides per month', included: true },
                      { text: 'Standard vehicle selection', included: true },
                      { text: 'Email support', included: true },
                      { text: 'Ride cancellation', included: false },
                      { text: 'Priority booking', included: false },
                    ],
                    callToAction: 'Choose Basic',
                    accentColor: 'green',
                  }}
                />
                
                {/* Premium Plan */}
                <PricingCard
                  tier={{
                    title: 'Premium',
                    price: 19.99,
                    period: 'month',
                    description: 'For frequent commuters and travelers',
                    features: [
                      { text: 'Unlimited rides', included: true },
                      { text: 'Premium vehicle selection', included: true },
                      { text: 'Priority support', included: true },
                      { text: 'Free ride cancellation', included: true },
                      { text: 'Priority booking', included: false },
                    ],
                    callToAction: 'Choose Premium',
                    popular: true,
                  }}
                />
                
                {/* Business Plan */}
                <PricingCard
                  tier={{
                    title: 'Business',
                    price: 29.99,
                    period: 'month',
                    description: 'Enterprise-grade transportation solution',
                    features: [
                      { text: 'Unlimited rides for team', included: true },
                      { text: 'Luxury vehicle options', included: true },
                      { text: '24/7 dedicated support', included: true },
                      { text: 'Free ride cancellation', included: true },
                      { text: 'Priority booking', included: true },
                    ],
                    callToAction: 'Choose Business',
                    accentColor: 'purple',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage; 