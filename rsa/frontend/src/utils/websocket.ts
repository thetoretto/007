// Mock WebSocket implementation with simulated events
// This uses timers and mock data instead of a real WebSocket connection

// Types for message formats
export interface WebSocketMessage {
  type: 'TRIP_UPDATE' | 'BOOKING_CONFIRMATION' | 'NEW_MESSAGE' | 'VEHICLE_LOCATION';
  payload: any;
}

interface MockWebSocketOptions {
  onOpen?: () => void;
  onMessage?: (event: { data: string }) => void;
  onError?: (event: Event) => void;
  onClose?: (event: { code: number; reason: string }) => void;
}

class MockWebSocket {
  private onOpenCallback?: () => void;
  private onMessageCallback?: (event: { data: string }) => void;
  private onErrorCallback?: (event: Event) => void;
  private onCloseCallback?: (event: { code: number; reason: string }) => void;
  private intervals: number[] = [];
  isConnected = false;
  
  constructor(url: string, options?: MockWebSocketOptions) {
    console.log(`Mock WebSocket created for ${url}`);
    this.onOpenCallback = options?.onOpen;
    this.onMessageCallback = options?.onMessage;
    this.onErrorCallback = options?.onError;
    this.onCloseCallback = options?.onClose;
    
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      if (this.onOpenCallback) this.onOpenCallback();
      this.setupMockMessages();
    }, 500);
  }
  
  set onopen(callback: () => void) {
    this.onOpenCallback = callback;
  }
  
  set onmessage(callback: (event: { data: string }) => void) {
    this.onMessageCallback = callback;
  }
  
  set onerror(callback: (event: Event) => void) {
    this.onErrorCallback = callback;
  }
  
  set onclose(callback: (event: { code: number; reason: string }) => void) {
    this.onCloseCallback = callback;
  }
  
  send(message: string): void {
    if (!this.isConnected) {
      console.error('MockWebSocket is not connected');
      return;
    }
    
    console.log('MockWebSocket message sent:', message);
    // Simulate response after sending a message
    try {
      const parsedMessage = JSON.parse(message);
      setTimeout(() => {
        if (parsedMessage.type === 'REQUEST_VEHICLE_LOCATION') {
          this.sendVehicleLocationUpdate();
        } else if (parsedMessage.type === 'BOOKING_REQUEST') {
          this.sendBookingConfirmation();
        }
      }, 800);
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  }
  
  close(): void {
    this.isConnected = false;
    this.intervals.forEach(clearInterval);
    if (this.onCloseCallback) {
      this.onCloseCallback({ code: 1000, reason: 'Mock connection closed' });
    }
  }
  
  private setupMockMessages(): void {
    // Simulate random vehicle location updates every 5 seconds
    const locationInterval = setInterval(() => {
      if (this.isConnected && Math.random() > 0.7) {
        this.sendVehicleLocationUpdate();
      }
    }, 5000);
    
    // Simulate random trip status updates every 10-15 seconds
    const statusInterval = setInterval(() => {
      if (this.isConnected && Math.random() > 0.8) {
        this.sendTripStatusUpdate();
      }
    }, 12000);
    
    this.intervals.push(locationInterval, statusInterval);
  }
  
  private sendVehicleLocationUpdate(): void {
    if (!this.onMessageCallback) return;
    
    // Random location near downtown area (example coordinates)
    const message: WebSocketMessage = {
      type: 'VEHICLE_LOCATION',
      payload: {
        tripId: `trip-${Math.floor(Math.random() * 1000)}`,
        vehicleId: `v${Math.floor(Math.random() * 3) + 1}`,
        location: {
          latitude: 40.7128 + (Math.random() - 0.5) * 0.05,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.05,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    this.onMessageCallback({ data: JSON.stringify(message) });
  }
  
  private sendTripStatusUpdate(): void {
    if (!this.onMessageCallback) return;
    
    const statuses = ['scheduled', 'active', 'completed', 'checked-in', 'validated'];
    const message: WebSocketMessage = {
      type: 'TRIP_UPDATE',
      payload: {
        tripId: `trip-${Math.floor(Math.random() * 1000)}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date().toISOString(),
        message: 'Trip status has been updated'
      }
    };
    
    this.onMessageCallback({ data: JSON.stringify(message) });
  }
  
  private sendBookingConfirmation(): void {
    if (!this.onMessageCallback) return;
    
    const message: WebSocketMessage = {
      type: 'BOOKING_CONFIRMATION',
      payload: {
        bookingId: `booking-${Math.floor(Math.random() * 1000)}`,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        message: 'Your booking has been confirmed!'
      }
    };
    
    this.onMessageCallback({ data: JSON.stringify(message) });
  }
}

// Singleton instance
let mockSocket: MockWebSocket | null = null;

export const connectWebSocket = (
  onOpen: () => void,
  onMessage: (event: MessageEvent) => void,
  onError: (event: Event) => void,
  onClose: (event: CloseEvent) => void
): MockWebSocket => {
  if (mockSocket && mockSocket.isConnected) {
    console.warn('MockWebSocket is already connected.');
    return mockSocket;
  }

  mockSocket = new MockWebSocket('mock://websocket', {
    onOpen,
    onMessage: onMessage as (event: { data: string }) => void,
    onError,
    onClose: onClose as (event: { code: number; reason: string }) => void
  });

  return mockSocket;
};

export const closeWebSocket = (): void => {
  if (mockSocket) {
    mockSocket.close();
    mockSocket = null;
  }
};

export const sendWebSocketMessage = (message: string | object): void => {
  if (!mockSocket) {
    console.error('MockWebSocket is not connected. Cannot send message.');
    return;
  }
  
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  mockSocket.send(messageStr);
};

// Example of how you might structure message types
// export interface WebSocketMessage {
//   type: 'TRIP_UPDATE' | 'BOOKING_CONFIRMATION' | 'NEW_MESSAGE';
//   payload: any;
// } 