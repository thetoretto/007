import { User, Passenger, Driver, Admin, Route, Vehicle, Seat, TimeSlot, Booking, Location, BookingExtra, PaymentMethod } from '../types';

// Static Content (can be moved elsewhere if needed)
export const promoMessages = [
  "Book in seconds, ride in minutes!",
  "Skip the calls, book online effortlessly.",
  "Secure your seat with just a few clicks.",
  "Real-time availability, instant confirmation.",
  "Manage your bookings easily, anytime, anywhere."
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'passenger',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: new Date(2023, 1, 15).toISOString(),
    updatedAt: new Date(2023, 1, 15).toISOString(),
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'passenger',
    createdAt: new Date(2023, 2, 20).toISOString(),
    updatedAt: new Date(2023, 2, 20).toISOString(),
  },
  {
    id: '3',
    email: 'driver@example.com',
    firstName: 'Robert',
    lastName: 'Johnson',
    role: 'driver',
    createdAt: new Date(2023, 0, 10).toISOString(),
    updatedAt: new Date(2023, 0, 10).toISOString(),
  },
  {
    id: '4',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date(2022, 11, 5).toISOString(),
    updatedAt: new Date(2022, 11, 5).toISOString(),
  },
];

// Mock Passengers
export const mockPassengers: Passenger[] = [
  {
    ...mockUsers[0] as Passenger,
    phoneNumber: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    paymentMethods: [
      {
        id: 'pm1',
        type: 'credit',
        last4: '4242',
        expiryDate: '12/25',
        isDefault: true,
      },
    ],
  },
  {
    ...mockUsers[1] as Passenger,
    phoneNumber: '555-987-6543',
    address: '456 Oak Ave, Somewhere, USA',
  },
];

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    ...mockUsers[2] as Driver,
    licenseNumber: 'DL123456',
    vehicleId: 'v1',
    rating: 4.8,
    isActive: true,
  },
];

// Mock Admins
export const mockAdmins: Admin[] = [
  {
    ...mockUsers[3] as Admin,
    department: 'Operations',
    permissions: ['manage_users', 'manage_trips', 'view_analytics'],
  },
];

// Mock Locations
export const mockLocations: Location[] = [
  {
    id: 'loc1',
    name: 'Downtown Station',
    address: '100 Main Street',
    city: 'Metropolis',
    state: 'NY',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    id: 'loc2',
    name: 'Airport Terminal',
    address: '1 Airport Road',
    city: 'Metropolis',
    state: 'NY',
    zipCode: '10002',
    latitude: 40.6413,
    longitude: -73.7781,
  },
  {
    id: 'loc3',
    name: 'Central Mall',
    address: '500 Shopping Lane',
    city: 'Metropolis',
    state: 'NY',
    zipCode: '10003',
    latitude: 40.7421,
    longitude: -73.9914,
  },
  {
    id: 'loc4',
    name: 'University Campus',
    address: '200 College Road',
    city: 'Metropolis',
    state: 'NY',
    zipCode: '10004',
    latitude: 40.7291,
    longitude: -73.9965,
  },
];

// Mock Routes
export const mockRoutes: Route[] = [
  {
    id: 'r1',
    name: 'Downtown to Airport',
    origin: mockLocations[0],
    destination: mockLocations[1],
    distance: 15.2,
    duration: 25,
    isActive: true,
  },
  {
    id: 'r2',
    name: 'Airport to Downtown',
    origin: mockLocations[1],
    destination: mockLocations[0],
    distance: 15.2,
    duration: 30,
    isActive: true,
  },
  {
    id: 'r3',
    name: 'Downtown to Mall',
    origin: mockLocations[0],
    destination: mockLocations[2],
    distance: 8.5,
    duration: 15,
    isActive: true,
  },
  {
    id: 'r4',
    name: 'University to Airport',
    origin: mockLocations[3],
    destination: mockLocations[1],
    distance: 20.1,
    duration: 35,
    isActive: true,
  },
];

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    model: 'Mercedes Sprinter',
    licensePlate: 'ABC-1234',
    capacity: 20,
    type: 'shuttle',
    features: ['air_conditioning', 'wifi', 'usb_charging'],
    isActive: true,
  },
  {
    id: 'v2',
    model: 'Ford Transit',
    licensePlate: 'XYZ-5678',
    capacity: 15,
    type: 'minibus',
    features: ['air_conditioning', 'wheelchair_accessible'],
    isActive: true,
  },
  {
    id: 'v3',
    model: 'Toyota Coaster',
    licensePlate: 'DEF-9012',
    capacity: 25,
    type: 'coach',
    features: ['air_conditioning', 'wifi', 'entertainment', 'restroom'],
    isActive: true,
  },
];

// Mock Seats for Vehicle 1
export const mockSeatsV1: Seat[] = Array.from({ length: 20 }, (_, i) => ({
  id: `s${i+1}v1`,
  number: `${i+1}`,
  vehicleId: 'v1',
  isAvailable: i < 15, // 15 seats available, 5 booked
  isHandicapAccessible: i === 0 || i === 1,
  position: {
    row: Math.floor(i / 4) + 1,
    column: (i % 4) + 1,
  },
}));

// Mock Seats for Vehicle 2
export const mockSeatsV2: Seat[] = Array.from({ length: 15 }, (_, i) => ({
  id: `s${i+1}v2`,
  number: `${i+1}`,
  vehicleId: 'v2',
  isAvailable: i < 10, // 10 seats available, 5 booked
  isHandicapAccessible: i === 0 || i === 1 || i === 2,
  position: {
    row: Math.floor(i / 3) + 1,
    column: (i % 3) + 1,
  },
}));

// All mock seats
export const mockSeats: Seat[] = [...mockSeatsV1, ...mockSeatsV2];

// Mock Time Slots
export const mockTimeSlots: TimeSlot[] = [
  {
    id: 'ts1',
    date: new Date(2025, 5, 15).toISOString().split('T')[0],
    time: '08:00',
    routeId: 'r1',
    vehicleId: 'v1',
    driverId: '3',
    availableSeats: 15,
    price: 25.99,
    isActive: true,
  },
  {
    id: 'ts2',
    date: new Date(2025, 5, 15).toISOString().split('T')[0],
    time: '10:30',
    routeId: 'r1',
    vehicleId: 'v1',
    driverId: '3',
    availableSeats: 12,
    price: 25.99,
    isActive: true,
  },
  {
    id: 'ts3',
    date: new Date(2025, 5, 15).toISOString().split('T')[0],
    time: '13:00',
    routeId: 'r1',
    vehicleId: 'v1',
    driverId: '3',
    availableSeats: 8,
    price: 25.99,
    isActive: true,
  },
  {
    id: 'ts4',
    date: new Date(2025, 5, 15).toISOString().split('T')[0],
    time: '15:30',
    routeId: 'r1',
    vehicleId: 'v1',
    driverId: '3',
    availableSeats: 3,
    price: 29.99,
    isActive: true,
  },
  {
    id: 'ts5',
    date: new Date(2025, 5, 15).toISOString().split('T')[0],
    time: '09:00',
    routeId: 'r2',
    vehicleId: 'v2',
    driverId: '3',
    availableSeats: 10,
    price: 25.99,
    isActive: true,
  },
  {
    id: 'ts6',
    date: new Date(2025, 5, 16).toISOString().split('T')[0],
    time: '08:00',
    routeId: 'r1',
    vehicleId: 'v1',
    driverId: '3',
    availableSeats: 20,
    price: 25.99,
    isActive: true,
  },
];

// Mock Booking Extras
export const mockExtras: BookingExtra[] = [
  {
    id: 'e1',
    name: 'Extra Luggage',
    description: 'Additional luggage allowance (up to 20kg)',
    price: 10.00,
    isAvailable: true,
  },
  {
    id: 'e2',
    name: 'Priority Boarding',
    description: 'Board first and choose your seat',
    price: 5.00,
    isAvailable: true,
  },
  {
    id: 'e3',
    name: 'Travel Insurance',
    description: 'Basic travel insurance coverage',
    price: 8.50,
    isAvailable: true,
  },
  {
    id: 'e4',
    name: 'Onboard Meal',
    description: 'Light meal and beverage during the trip',
    price: 12.00,
    isAvailable: true,
  },
];

// Mock Payment Methods
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'credit',
    last4: '4242',
    expiryDate: '12/25',
    isDefault: true,
  },
  {
    id: 'pm2',
    type: 'debit',
    last4: '9876',
    expiryDate: '06/24',
    isDefault: false,
  },
  {
    id: 'pm3',
    type: 'paypal',
    last4: '',
    isDefault: false,
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'b1',
    passengerId: '1',
    routeId: 'r1',
    vehicleId: 'v1',
    timeSlotId: 'ts1',
    seatId: 's5v1',
    status: 'confirmed',
    hasDoorstepPickup: true,
    pickupAddress: '123 Main St, Anytown, USA',
    extras: [
      { extraId: 'e1', quantity: 1 },
      { extraId: 'e3', quantity: 1 },
    ],
    fare: {
      baseFare: 25.99,
      fees: 2.50,
      extras: 18.50,
      discount: 0,
      total: 46.99,
    },
    paymentStatus: 'paid',
    paymentMethod: mockPaymentMethods[0],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: 'b2',
    passengerId: '1',
    routeId: 'r3',
    vehicleId: 'v2',
    timeSlotId: 'ts5',
    seatId: 's2v2',
    status: 'pending',
    hasDoorstepPickup: false,
    extras: [
      { extraId: 'e2', quantity: 1 },
    ],
    fare: {
      baseFare: 25.99,
      fees: 2.50,
      extras: 5.00,
      discount: 0,
      total: 33.49,
    },
    paymentStatus: 'pending',
    createdAt: new Date(2025, 5, 2).toISOString(),
    updatedAt: new Date(2025, 5, 2).toISOString(),
  },
  {
    id: 'b3',
    passengerId: '2',
    routeId: 'r2',
    vehicleId: 'v1',
    timeSlotId: 'ts3',
    seatId: 's10v1',
    status: 'completed',
    hasDoorstepPickup: true,
    pickupAddress: '456 Oak Ave, Somewhere, USA',
    extras: [],
    fare: {
      baseFare: 25.99,
      fees: 2.50,
      extras: 0,
      discount: 5.00,
      total: 23.49,
    },
    paymentStatus: 'paid',
    paymentMethod: mockPaymentMethods[1],
    createdAt: new Date(2025, 4, 20).toISOString(),
    updatedAt: new Date(2025, 4, 20).toISOString(),
    checkedInAt: new Date(2025, 5, 15, 12, 45).toISOString(),
  },
];

// Helper function to get bookings with related data
export const getBookingsWithDetails = () => {
  return mockBookings.map(booking => {
    const route = mockRoutes.find(r => r.id === booking.routeId);
    const vehicle = mockVehicles.find(v => v.id === booking.vehicleId);
    const timeSlot = mockTimeSlots.find(ts => ts.id === booking.timeSlotId);
    const passenger = mockPassengers.find(p => p.id === booking.passengerId);
    
    return {
      ...booking,
      route,
      vehicle,
      timeSlot,
      passenger,
    };
  });
};

// Dashboard stats
export const mockDashboardStats = {
  totalUsers: 50,
  activeDrivers: 8,
  upcomingTrips: 15,
  totalBookings: 120,
  totalRevenue: 4250.75,
};

// Booking stats for charts
export const mockBookingStats = [
  { date: '2025-05-01', bookings: 5, revenue: 165.95 },
  { date: '2025-05-02', bookings: 7, revenue: 230.93 },
  { date: '2025-05-03', bookings: 4, revenue: 135.96 },
  { date: '2025-05-04', bookings: 6, revenue: 198.94 },
  { date: '2025-05-05', bookings: 8, revenue: 265.92 },
  { date: '2025-05-06', bookings: 10, revenue: 331.90 },
  { date: '2025-05-07', bookings: 12, revenue: 397.88 },
  { date: '2025-05-08', bookings: 9, revenue: 298.91 },
  { date: '2025-05-09', bookings: 7, revenue: 230.93 },
  { date: '2025-05-10', bookings: 8, revenue: 265.92 },
  { date: '2025-05-11', bookings: 6, revenue: 198.94 },
  { date: '2025-05-12', bookings: 5, revenue: 165.95 },
  { date: '2025-05-13', bookings: 7, revenue: 230.93 },
  { date: '2025-05-14', bookings: 9, revenue: 298.91 },
  { date: '2025-05-15', bookings: 11, revenue: 364.89 },
];

// Route popularity
export const mockRoutePopularity = [
  { routeId: 'r1', routeName: 'Downtown to Airport', bookings: 42, percentage: 35 },
  { routeId: 'r2', routeName: 'Airport to Downtown', bookings: 38, percentage: 31.7 },
  { routeId: 'r3', routeName: 'Downtown to Mall', bookings: 25, percentage: 20.8 },
  { routeId: 'r4', routeName: 'University to Airport', bookings: 15, percentage: 12.5 },
];