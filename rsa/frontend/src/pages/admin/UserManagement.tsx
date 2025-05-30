import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import { 
  Users, Search, Edit, Trash2, UserPlus, Filter, X, Save, PlusCircle, 
  Download, MoreHorizontal, CheckCircle, XCircle, AlertCircle, ChevronLeft, 
  ChevronRight, ArrowUp, ArrowDown, RefreshCw, Eye, EyeOff, Check, Clipboard,
  Key, Mail, User as UserIcon // Added Key, Mail, UserIcon
} from 'react-feather';
import { mockUsers as initialMockUsers } from '../../utils/mockData'; 
import { User, UserStatus, UserRole } from '../../types';
import '../../index.css';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import Navbar from '../../components/common/Navbar';


// Enhanced Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClass = size === 'lg' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className={`relative mx-auto p-5 border w-full ${sizeClass} shadow-lg rounded-md card dark:bg-gray-800`}>
        <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const { user: adminUser, updateUserStatus, register, updateUserProfile, deleteUser } = useAuthStore();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>(() => 
    initialMockUsers.map(u => ({ ...u, status: u.status || 'active' }))
  ); 
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Added for async operations

  const [newUser, setNewUser] = useState<Partial<User> & { password?: string; phoneNumber?: string }>({
    firstName: '', 
    lastName: '', 
    email: '', 
    role: 'passenger', 
    status: 'active', 
    password: '',
    phoneNumber: ''
  });

  const userStats = useMemo(() => {
    const total = users.length;
    const passengers = users.filter(u => u.role === 'passenger').length;
    const drivers = users.filter(u => u.role === 'driver').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    return { total, passengers, drivers, admins, active, inactive };
  }, [users]);

  const filteredUsers = useMemo(() => users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(term) || email.includes(term);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }), [users, searchTerm, roleFilter, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value as UserRole | 'all');
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as UserStatus | 'all');
  };

  const openAddModal = () => {
    setNewUser({ firstName: '', lastName: '', email: '', role: 'passenger', status: 'active', password: '', phoneNumber: '' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.role || !newUser.phoneNumber) {
        addToast('Validation Error: Please fill in all required fields.', 'error');
        return;
    }
    setIsLoading(true);
    try {
      await register({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as UserRole,
        phoneNumber: newUser.phoneNumber,
      });
      setUsers(initialMockUsers.map(u => ({ ...u, status: u.status || 'active' }))); 
      closeAddModal();
      addToast(`User Added: ${newUser.firstName} ${newUser.lastName} added.`, 'success');
    } catch (error) {
      addToast(`Failed to Add User: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editingUser.firstName || !editingUser.lastName || !editingUser.email) {
        addToast('Validation Error: Please fill in all required fields.', 'error');
        return;
    }
    setIsLoading(true);
    try {
      const { id, createdAt, updatedAt, password, ...profileData } = editingUser;
      await updateUserProfile(editingUser.id, profileData as Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'role' | 'status'>>);
      setUsers(initialMockUsers.map(u => ({ ...u, status: u.status || 'active' })));
      closeEditModal();
      addToast(`User Updated: ${editingUser.firstName} ${editingUser.lastName}'s info updated.`, 'success');
    } catch (error) {
      addToast(`Failed to Update User: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        const userToDelete = users.find(u => u.id === userId);
        await deleteUser(userId);
        setUsers(initialMockUsers.map(u => ({ ...u, status: u.status || 'active' })));
        addToast(userToDelete ? `User Deleted: ${userToDelete.firstName} ${userToDelete.lastName} deleted.` : 'User deleted.', 'success');
      } catch (error) {
        addToast(`Failed to Delete User: ${(error as Error).message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEditing: boolean) => {
    const { name, value } = e.target;
    if (isEditing && editingUser) {
      setEditingUser({ ...editingUser, [name]: value as any });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setIsLoading(true);
    try {
      const userToUpdate = users.find(u => u.id === userId);
      await updateUserStatus(userId, newStatus);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } : u)
      );
      addToast(userToUpdate ? `Status Updated: ${userToUpdate.firstName} ${userToUpdate.lastName}'s status set to ${newStatus}.` : `User status updated to ${newStatus}.`, 'success');
    } catch (error) {
      addToast(`Failed to Update Status: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <ToastContainer />

      <main className="container-app pt-24 pb-8 md:pt-28 md:pb-12">
        {/* Dashboard Stats Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">User Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(userStats).map(([key, value]) => (
              <div key={key} className="card p-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 capitalize truncate transition-colors duration-300">{key === 'total' ? 'Total Users' : key}</h3>
                <p className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Management Table Section */}
        <div className="mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex-1 min-w-0 mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                <Users className="h-7 w-7 mr-3 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
              User Management
            </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Manage all users across the platform
            </p>
          </div>
          <div className="mt-4 flex sm:mt-0 sm:ml-4">
            <button 
              onClick={openAddModal} 
                className="btn btn-primary inline-flex items-center w-full sm:w-auto justify-center gap-2"
              disabled={isLoading}
            >
                <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

          <div className="card rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Users ({filteredUsers.length})</h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                {/* Role Filter */}
                <div className="flex-1 sm:flex-none">
                  <label htmlFor="role-filter" className="sr-only">Role:</label>
                  <select
                    id="role-filter"
                      className="form-select block w-full text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors duration-300"
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                  >
                    <option value="all">All Roles</option>
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex-1 sm:flex-none">
                  <label htmlFor="status-filter" className="sr-only">Status:</label>
                  <select
                    id="status-filter"
                      className="form-select block w-full text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors duration-300"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Search Input */}
                  <div className="relative flex-1 sm:flex-none md:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                      className="form-input pl-10 pr-4 py-2 block w-full text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors duration-300"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Name</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell transition-colors duration-300">Email</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Role</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell transition-colors duration-300">Status</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell transition-colors duration-300">Joined</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Actions</th>
                </tr>
              </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {isLoading && filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mb-2 transition-colors duration-300"></div>
                      <div>Loading users...</div>
                    </td>
                  </tr>
                )}
                {!isLoading && filteredUsers.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center transition-colors duration-300">
                              <span className="text-primary-800 dark:text-primary-100 font-medium transition-colors duration-300">
                              {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 sm:ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{u.firstName} {u.lastName}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 md:hidden transition-colors duration-300">{u.email}</div>
                          </div>
                        </div>
                      </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell transition-colors duration-300">{u.email}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            u.role === 'admin' ? 'badge-error' : // Using error badge for admin role for visibility
                            u.role === 'driver' ? 'badge-success' :
                            'badge-primary' // Using primary badge for passenger role
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <button 
                          onClick={() => handleToggleUserStatus(u.id, u.status as UserStatus)}
                            className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full transition-opacity hover:opacity-80 transition-colors duration-300 ${u.status === 'active' ? 'badge-success' : 'badge-error'}`}
                          aria-label={`Toggle status for ${u.firstName} ${u.lastName}, current status ${u.status}`}
                        >
                          {u.status}
                        </button>
                      </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden lg:table-cell transition-colors duration-300">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => openEditModal(u)}
                              className="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-ghost btn-sm text-error dark:text-error-light p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status as UserStatus)}
                              className={`sm:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ${u.status === 'active' ? 'text-success' : 'text-error'}`}
                            title={u.status === 'active' ? "Deactivate User" : "Activate User"}
                          >
                            {u.status === 'active' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add New User" size="lg">
          <form onSubmit={handleAddUser} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">First Name</label>
                <input type="text" name="firstName" id="firstName" value={newUser.firstName || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input w-full" required placeholder="John" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={newUser.lastName || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input w-full" required placeholder="Doe" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                </div>
                <input type="email" name="email" id="email" value={newUser.email || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input w-full pl-10" required placeholder="john.doe@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Phone Number</label>
              <input type="tel" name="phoneNumber" id="phoneNumber" value={newUser.phoneNumber || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input w-full" required placeholder="+1234567890" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Role</label>
                <select name="role" id="role" value={newUser.role || 'passenger'} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-select w-full">
                  <option value="passenger">Passenger</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  </div>
                  <input type="password" name="password" id="password" value={newUser.password || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input w-full pl-10" required placeholder="••••••••" />
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button type="button" onClick={closeAddModal} className="btn btn-ghost w-full sm:w-auto" disabled={isLoading}>Cancel</button>
              <button type="submit" className="btn btn-primary inline-flex items-center justify-center w-full sm:w-auto gap-2" disabled={isLoading}>
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div> : <UserPlus size={16} />}
                Add User
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit User" size="lg">
          {editingUser && (
            <form onSubmit={handleEditUser} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">First Name</label>
                  <input type="text" name="firstName" id="editFirstName" value={editingUser.firstName || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-input w-full" required />
                </div>
                <div>
                  <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Last Name</label>
                  <input type="text" name="lastName" id="editLastName" value={editingUser.lastName || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-input w-full" required />
                </div>
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  </div>
                  <input type="email" name="email" id="editEmail" value={editingUser.email || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-input w-full pl-10" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Role</label>
                  <select name="role" id="editRole" value={editingUser.role || 'passenger'} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-select w-full">
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Status</label>
                  <select name="status" id="editStatus" value={editingUser.status || 'active'} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-select w-full">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button type="button" onClick={closeEditModal} className="btn btn-ghost w-full sm:w-auto" disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary inline-flex items-center justify-center w-full sm:w-auto gap-2" disabled={isLoading}>
                  {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default UserManagement;