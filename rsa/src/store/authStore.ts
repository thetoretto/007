import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, User } from '../types';
import { mockUsers, mockPassengers, mockDrivers, mockAdmins } from '../utils/mockData';
import { jwtDecode } from 'jwt-decode';

// For demo purposes, we're using mock data and localStorage
// In a real app, you would use API calls to a backend server

const getStoredAuth = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return { user: null, token: null };

    // This is just for demo purposes - normally you'd decode the JWT
    const decoded = jwtDecode<{ userId: string; role: string }>(token);
    
    // Find user based on decoded data
    let user: User | null = null;
    
    if (decoded.role === 'passenger') {
      user = mockPassengers.find(p => p.id === decoded.userId) || null;
    } else if (decoded.role === 'driver') {
      user = mockDrivers.find(d => d.id === decoded.userId) || null;
    } else if (decoded.role === 'admin') {
      user = mockAdmins.find(a => a.id === decoded.userId) || null;
    }
    
    return { user, token };
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    localStorage.removeItem('auth_token');
    return { user: null, token: null };
  }
};

// Simple function to generate a fake JWT token
const generateFakeToken = (userId: string, role: string): string => {
  // This is NOT how you would actually create a JWT
  // This is just for demo purposes
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    role,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa(`fake-signature-${userId}-${role}`);
  
  return `${header}.${payload}.${signature}`;
};

const useAuthStore = create<AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}>((set) => ({
  ...getStoredAuth(),
  loading: false,
  error: null,
  
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the credentials match any of our mock users
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // In a real app, you would validate the password here
      // For demo purposes, we're just checking the email
      
      let userDetails: User;
      
      if (user.role === 'passenger') {
        userDetails = mockPassengers.find(p => p.id === user.id) || user;
      } else if (user.role === 'driver') {
        userDetails = mockDrivers.find(d => d.id === user.id) || user;
      } else if (user.role === 'admin') {
        userDetails = mockAdmins.find(a => a.id === user.id) || user;
      } else {
        userDetails = user;
      }
      
      // Generate token
      const token = generateFakeToken(user.id, user.role);
      
      // Store in localStorage if rememberMe is true
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', token);
      }
      
      set({ user: userDetails, token, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === data.email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: `user${mockUsers.length + 1}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Generate token
      const token = generateFakeToken(newUser.id, newUser.role);
      
      // Store in localStorage
      localStorage.setItem('auth_token', token);
      
      set({ user: newUser, token, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },
  
  checkAuth: () => {
    set(getStoredAuth());
  },
}));

export default useAuthStore;