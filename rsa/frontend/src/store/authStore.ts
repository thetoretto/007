import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, User, UserStatus, UserRole } from '../types'; // Updated import
import { mockUsers, mockPassengers, mockDrivers, mockAdmins } from '../utils/mockData'; // Assuming mockUsers have phoneNumbers added

import { jwtDecode } from 'jwt-decode';

// For demo purposes, we're using mock data and localStorage
// In a real app, you would use API calls to a backend server

const getStoredAuth = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return { user: null, token: null };

    // This is just for demo purposes - normally you'd decode the JWT
    const decoded = jwtDecode<{ userId: string; role: UserRole }>(token); // Use UserRole type
    
    // Find user based on decoded data
    let userObject: User | undefined;
    
    if (decoded.role === 'passenger') {
      userObject = mockPassengers.find(p => p.id === decoded.userId);
    } else if (decoded.role === 'driver') {
      userObject = mockDrivers.find(d => d.id === decoded.userId);
    } else if (decoded.role === 'admin') {
      userObject = mockAdmins.find(a => a.id === decoded.userId);
    }

    if (userObject) {
      // Ensure status is part of the user object when retrieved
      const userWithStatus: User = {
        ...userObject,
        status: userObject.status || 'active', // Default to active if status is missing from mock
      };
      return { user: userWithStatus, token };
    }
    
    return { user: null, token: null };
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    localStorage.removeItem('auth_token');
    return { user: null, token: null };
  }
};

// Simple function to generate a fake JWT token
const generateFakeToken = (userId: string, role: UserRole): string => { // Use UserRole type
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
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>; // Can be used for deactivation
  updateUserProfile: (userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phoneNumber'>>) => Promise<void>; // Specific for profile fields
  // deleteUser can be kept for hard delete if needed, or repurposed/clarified for deactivation
  deactivateAccount: (userId: string) => Promise<void>; // Explicit deactivation function
  changePassword: (userId: string, newPassword: string) => Promise<void>; // For changing password
  deleteUser: (userId: string) => Promise<void>;
}>((set, get) => ({
  ...getStoredAuth(),
  loading: false,
  error: null,
  
  login: async (credentials: LoginCredentials) => { // Ensure LoginCredentials type is used
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the credentials match any of our mock users by email or phone
      const { emailOrPhone, password } = credentials;
      const user = mockUsers.find(u => 
        u.email === emailOrPhone || (u.phoneNumber && u.phoneNumber === emailOrPhone)
      );

      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // In a real app, you would validate the password here
      // For demo purposes, we're just checking the email
      
      let userDetails: User;
      // Ensure userDetails includes status, defaulting to 'active' if not present in mock data initially
      const baseUser = {
        ...user,
        status: user.status || 'active', // Default to active if status is missing
      };
      
      if (baseUser.role === 'passenger') {
        userDetails = { ...baseUser, ...(mockPassengers.find(p => p.id === baseUser.id) || {}) } as User;
      } else if (baseUser.role === 'driver') {
        userDetails = { ...baseUser, ...(mockDrivers.find(d => d.id === baseUser.id) || {}) } as User;
      } else if (baseUser.role === 'admin') {
        userDetails = { ...baseUser, ...(mockAdmins.find(a => a.id === baseUser.id) || {}) } as User;
      } else {
        userDetails = baseUser;
      }
      // Ensure status is explicitly set, defaulting to 'active'
      userDetails.status = userDetails.status || 'active';
      
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
        status: 'active', // New users are active by default
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

  updateUserProfile: async (userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phoneNumber'>>) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');

      // Basic email validation if email is being changed
      if (data.email && mockUsers.some(u => u.email === data.email && u.id !== userId)) {
        throw new Error('Email already in use by another account.');
      }
      // Basic phone validation if phone is being changed
      if (data.phoneNumber && mockUsers.some(u => u.phoneNumber === data.phoneNumber && u.id !== userId)) {
        throw new Error('Phone number already in use by another account.');
      }

      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updatedAt: new Date().toISOString() };

      const updateUserInRoleArray = (arr: User[], id: string, newData: Partial<User>) => {
        const idx = arr.findIndex(u => u.id === id);
        if (idx !== -1) arr[idx] = { ...arr[idx], ...newData, updatedAt: new Date().toISOString() };
      };
      updateUserInRoleArray(mockPassengers, userId, data);
      updateUserInRoleArray(mockDrivers, userId, data);
      updateUserInRoleArray(mockAdmins, userId, data);

      const currentUser = get().user;
      if (currentUser && currentUser.id === userId) {
        set({ user: { ...currentUser, ...data } as User, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  deactivateAccount: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // This uses the existing updateUserStatus logic internally if UserStatus includes 'deactivated'
      // Or directly updates the status in mockUsers and current user state
      await new Promise(resolve => setTimeout(resolve, 500));
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');

      const newStatus: UserStatus = 'inactive'; // Assuming 'inactive' or 'deactivated' is a valid UserStatus
      mockUsers[userIndex].status = newStatus;
      mockUsers[userIndex].updatedAt = new Date().toISOString();

      const updateUserStatusInRoleArray = (arr: User[], id: string, status: UserStatus) => {
        const idx = arr.findIndex(u => u.id === id);
        if (idx !== -1) {
          arr[idx].status = status;
          arr[idx].updatedAt = new Date().toISOString();
        }
      };
      updateUserStatusInRoleArray(mockPassengers, userId, newStatus);
      updateUserStatusInRoleArray(mockDrivers, userId, newStatus);
      updateUserStatusInRoleArray(mockAdmins, userId, newStatus);

      const currentUser = get().user;
      if (currentUser && currentUser.id === userId) {
        set({ user: { ...currentUser, status: newStatus }, loading: false });
        // Optionally log out the user after deactivation
        // get().logout(); 
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  changePassword: async (userId: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      // In a real app, you'd hash the password here.
      // For mock, we'll just store it, but this is NOT secure.
      mockUsers[userIndex].password = newPassword; // Assuming User type has password field for this mock setup
      mockUsers[userIndex].updatedAt = new Date().toISOString();

      // No need to update role-specific arrays if password is not part of their specific types
      // and is handled at the base User level.

      set({ loading: false });
      // Password change doesn't necessarily update the user object in the store unless other info changes.
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  updateUser: async (userId: string, data: Partial<User>) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');

      // Update mockUsers (main source of truth for user list in this demo)
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updatedAt: new Date().toISOString() };

      // Update specific role arrays if they exist and are used elsewhere
      const updateUserInRoleArray = (arr: User[], id: string, newData: Partial<User>) => {
        const idx = arr.findIndex(u => u.id === id);
        if (idx !== -1) arr[idx] = { ...arr[idx], ...newData, updatedAt: new Date().toISOString() };
      };
      updateUserInRoleArray(mockPassengers, userId, data);
      updateUserInRoleArray(mockDrivers, userId, data);
      updateUserInRoleArray(mockAdmins, userId, data);

      // If the updated user is the currently logged-in user, update their state
      const currentUser = get().user;
      if (currentUser && currentUser.id === userId) {
        set({ user: { ...currentUser, ...data } as User, loading: false });
      } else {
        set({ loading: false });
      }
      // UserManagement.tsx will need to re-fetch or update its local state
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');

      mockUsers.splice(userIndex, 1);

      // Remove from role-specific arrays as well
      const removeFromRoleArray = (arr: User[], id: string) => {
        const idx = arr.findIndex(u => u.id === id);
        if (idx !== -1) arr.splice(idx, 1);
      };
      removeFromRoleArray(mockPassengers, userId);
      removeFromRoleArray(mockDrivers, userId);
      removeFromRoleArray(mockAdmins, userId);

      // If the deleted user is the currently logged-in user, log them out
      const currentUser = get().user;
      if (currentUser && currentUser.id === userId) {
        get().logout();
      }
      set({ loading: false });
      // UserManagement.tsx will need to re-fetch or update its local state
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real app, you would make an API call to update the user's status
      // For mock data, we update the mockUsers array and then update the store's user if it's the same user
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        mockUsers[userIndex].status = status;
        mockUsers[userIndex].updatedAt = new Date().toISOString();
      }

      // Update specific role arrays if needed (though UserManagement.tsx manages its own list)
      const passengerIndex = mockPassengers.findIndex(p => p.id === userId);
      if (passengerIndex !== -1) mockPassengers[passengerIndex].status = status;

      const driverIndex = mockDrivers.findIndex(d => d.id === userId);
      if (driverIndex !== -1) mockDrivers[driverIndex].status = status;

      const adminIndex = mockAdmins.findIndex(a => a.id === userId);
      if (adminIndex !== -1) mockAdmins[adminIndex].status = status;

      // If the updated user is the currently logged-in user, update their state
      const currentUser = get().user;
      if (currentUser && currentUser.id === userId) {
        set({ user: { ...currentUser, status }, loading: false });
      } else {
        set({ loading: false });
      }
      // Note: UserManagement.tsx will likely re-fetch or manage its own state for the user list display
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
}));

export default useAuthStore;