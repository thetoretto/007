import { TripActivity } from './components/common/TripActivityLog';

export const mockTripActivities: TripActivity[] = [
  {
    id: 'trip-1',
    fromLocation: 'Downtown Station',
    toLocation: 'Airport Terminal 2',
    date: '2023-09-12',
    time: '14:30',
    price: 32.50,
    status: 'in-progress',
    passengers: 1,
    driver: {
      name: 'Michael Chen',
      rating: 4.8,
      vehicleInfo: 'Tesla Model Y (White) • ABC123'
    },
    lastUpdated: '2 minutes ago',
    estimatedArrival: '15:05',
    paymentMethod: 'Visa •••• 4242',
    notes: 'Driver is taking the express route due to traffic',
    progressPercentage: 65
  },
  {
    id: 'trip-2',
    fromLocation: 'Central Mall',
    toLocation: 'Riverside Apartments',
    date: new Date().toISOString().split('T')[0], // Today
    time: '18:45',
    price: 18.75,
    status: 'completed',
    passengers: 2,
    driver: {
      name: 'Sarah Johnson',
      rating: 4.9,
      vehicleInfo: 'Honda Civic (Blue) • XYZ789'
    },
    lastUpdated: '2 days ago',
    paymentMethod: 'Mastercard •••• 8888',
    progressPercentage: 100
  },
  {
    id: 'trip-3',
    fromLocation: 'Conference Center',
    toLocation: 'Hilton Hotel',
    date: '2023-09-15',
    time: '09:15',
    price: 12.25,
    status: 'scheduled',
    passengers: 1,
    lastUpdated: 'Just now',
    paymentMethod: 'PayPal',
    progressPercentage: 0
  },
  {
    id: 'trip-4',
    fromLocation: 'University Campus',
    toLocation: 'Tech District',
    date: '2023-09-08',
    time: '10:30',
    price: 24.00,
    status: 'cancelled',
    passengers: 3,
    lastUpdated: '4 days ago',
    notes: 'Cancelled due to unexpected delay',
    progressPercentage: 0
  },
  {
    id: 'trip-5',
    fromLocation: 'Sunset Beach',
    toLocation: 'Downtown Hotels',
    date: new Date().toISOString().split('T')[0], // Today
    time: '16:20',
    price: 27.50,
    status: 'delayed',
    passengers: 2,
    driver: {
      name: 'David Wilson',
      rating: 4.7,
      vehicleInfo: 'Toyota Camry (Silver) • LMN456'
    },
    lastUpdated: '20 minutes ago',
    estimatedArrival: '17:05',
    paymentMethod: 'Apple Pay',
    notes: 'Delayed due to road construction',
    progressPercentage: 40
  },
  {
    id: 'trip-6',
    fromLocation: 'Green Park',
    toLocation: 'City Hospital',
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3); // 3 days ago
      return date.toISOString().split('T')[0];
    })(),
    time: '08:15',
    price: 15.50,
    status: 'completed',
    passengers: 1,
    driver: {
      name: 'Emma Roberts',
      rating: 4.5,
      vehicleInfo: 'Hyundai Sonata (Gray) • DEF456'
    },
    lastUpdated: '3 days ago',
    paymentMethod: 'Apple Pay',
    progressPercentage: 100
  },
  {
    id: 'trip-7',
    fromLocation: 'Public Library',
    toLocation: 'Science Museum',
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 2); // 2 days in future
      return date.toISOString().split('T')[0];
    })(),
    time: '13:00',
    price: 22.75,
    status: 'scheduled',
    passengers: 4,
    lastUpdated: '1 hour ago',
    paymentMethod: 'PayPal',
    progressPercentage: 0
  }
];