// Notification utilities

// Mock notification utilities for simulation

// Custom notification types
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  onClick?: () => void;
}

// Store for in-app notifications
const notificationStore: AppNotification[] = [];

// Check if browser notifications are supported
const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Simulates checking notification permission.
 * In a real app, this would actually check browser permissions.
 * @returns Promise<boolean> - True by default in simulation.
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!isBrowserNotificationSupported()) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  // In simulation, we'll pretend permission is granted
  console.log('Notification permission granted (simulation)');
  return true;
};

/**
 * Shows a simulated browser notification, and also stores it in the in-app notification system.
 * @param title - The title of the notification.
 * @param options - Optional NotificationOptions (body, icon, etc.).
 * @param onClick - Optional callback function when the notification is clicked.
 * @returns Promise<void>
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions,
  onClick?: () => void
): Promise<void> => {
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted (simulation).');
    return;
  }

  // Create an in-app notification
  const notification: AppNotification = {
    id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    body: options?.body || '',
    type: 'info',
    timestamp: new Date(),
    read: false,
    onClick
  };

  // Add to our notification store
  notificationStore.push(notification);
  
  console.log('Notification shown (simulation):', notification);

  // Browser notification - only shown if actually supported
  if (isBrowserNotificationSupported()) {
    try {
      // Create a browser notification if available
      const browserNotification = new Notification(title, options);
      
      if (onClick) {
        browserNotification.onclick = () => {
          onClick();
          browserNotification.close();
        };
      }
      
      // Auto-close after 5 seconds
      setTimeout(() => browserNotification.close(), 5000);
    } catch (e) {
      console.error('Error creating browser notification:', e);
    }
  }
};

/**
 * Gets all notifications from the in-app notification store
 * @returns AppNotification[] - Array of notifications
 */
export const getNotifications = (): AppNotification[] => {
  return [...notificationStore];
};

/**
 * Marks a notification as read
 * @param id - ID of the notification to mark as read
 * @returns boolean - Whether the notification was found and updated
 */
export const markNotificationAsRead = (id: string): boolean => {
  const notification = notificationStore.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
};

/**
 * Clears all notifications from the store
 */
export const clearAllNotifications = (): void => {
  notificationStore.length = 0;
};

/**
 * Generates some random example notifications for testing
 * @param count - Number of random notifications to generate
 */
export const generateExampleNotifications = (count: number = 5): void => {
  const titles = [
    'Booking Confirmed!',
    'Trip Starting Soon',
    'Driver Arriving',
    'Special Offer',
    'Account Update',
    'Trip Completed'
  ];
  
  const bodies = [
    'Your trip from Downtown to Airport has been confirmed.',
    'Your trip is starting in 15 minutes. Be ready!',
    'Your driver is arriving in 5 minutes.',
    'Get 20% off your next booking with code SAVE20.',
    'Your account details have been updated successfully.',
    'Thanks for riding with us! Please rate your experience.'
  ];
  
  const types: Array<AppNotification['type']> = ['success', 'info', 'warning', 'error'];
  
  for (let i = 0; i < count; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Create with a random timestamp in the last 24 hours
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
    
    notificationStore.push({
      id: `example-${Date.now()}-${i}`,
      title,
      body,
      type,
      timestamp,
      read: Math.random() > 0.7, // Some are read, some unread
    });
  }
};

// Example Usage:
// import { showNotification, checkNotificationPermission } from './notifications';

// // Request permission when the app loads or at an appropriate time
// checkNotificationPermission().then(hasPermission => {
//   if (hasPermission) {
//     console.log('Notification permission granted.');
//   }
// });

// // Show a notification
// showNotification('Booking Confirmed!', {
//   body: 'Your trip from A to B has been confirmed.',
//   icon: '/path/to/icon.png' // Optional icon
// }, () => {
//   console.log('Notification clicked, navigate to bookings page or something.');
//   // window.location.href = '/bookings'; // Example navigation
// }); 