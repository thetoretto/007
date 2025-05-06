import React, { useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import { Users, Search, Edit, Trash2, UserPlus, Filter, X, Save, PlusCircle } from 'react-feather';
import { mockUsers as initialMockUsers } from '../../utils/mockData'; // Assuming mockData provides the initial list
import { User } from '../../types'; // Assuming a User type exists

// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

// Basic Modal Component (Replace with your actual Modal component if available)
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const { user: adminUser } = useAuthStore(); // Renamed to avoid conflict
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>(initialMockUsers); // Use User type
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Assuming status exists or will be added

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'passenger', status: 'active' }); // Default values

  // Calculate dashboard stats
  const userStats = useMemo(() => {
    const total = users.length;
    const passengers = users.filter(u => u.role === 'passenger').length;
    const drivers = users.filter(u => u.role === 'driver').length;
    const admins = users.filter(u => u.role === 'admin').length;
    // Add status counts if needed
    // const active = users.filter(u => u.status === 'active').length;
    // const inactive = users.filter(u => u.status === 'inactive').length;
    return { total, passengers, drivers, admins };
  }, [users]);

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    // const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole; // && matchesStatus;
  }), [users, searchTerm, roleFilter, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // --- CRUD Handlers ---
  const openAddModal = () => {
    setNewUser({ firstName: '', lastName: '', email: '', role: 'passenger', status: 'active' }); // Reset form
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (add more robust validation as needed)
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
        alert('Please fill in all required fields.');
        return;
    }
    const userToAdd: User = {
      id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simple unique ID generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newUser,
    } as User;
    setUsers([...users, userToAdd]);
    closeAddModal();
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    // Basic validation
    if (!editingUser.firstName || !editingUser.lastName || !editingUser.email) {
        alert('Please fill in all required fields.');
        return;
    }
    setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, updatedAt: new Date().toISOString() } : u));
    closeEditModal();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEditing: boolean) => {
    const { name, value } = e.target;
    if (isEditing && editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  // --- Render --- 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="admin" />
      </React.Suspense>

      {/* Dashboard Stats Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{userStats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Passengers</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600">{userStats.passengers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Drivers</h3>
            <p className="mt-1 text-3xl font-semibold text-green-600">{userStats.drivers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Admins</h3>
            <p className="mt-1 text-3xl font-semibold text-purple-600">{userStats.admins}</p>
          </div>
        </div>
      </div>

      {/* User Management Table Section */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all users across the platform
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button onClick={openAddModal} className="btn btn-primary inline-flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h2>

            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              {/* Role Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="role-filter" className="text-sm text-gray-500">Role:</label>
                <select
                  id="role-filter"
                  className="form-select border-gray-300 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm rounded-md"
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                >
                  <option value="all">All Roles</option>
                  <option value="passenger">Passenger</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status Filter (Optional - uncomment if status is added to User type and mock data) */}
              {/* <div className="flex items-center space-x-2">
                <label htmlFor="status-filter" className="text-sm text-gray-500">Status:</label>
                <select
                  id="status-filter"
                  className="form-select border-gray-300 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div> */}

              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10 pr-4 py-2 border-gray-300 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm rounded-md"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'driver' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    {/* Status Cell (Optional) */}
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.status}
                      </span>
                    </td> */}
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input type="text" name="firstName" id="firstName" value={newUser.firstName || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" name="lastName" id="lastName" value={newUser.lastName || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" value={newUser.email || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-input block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select name="role" id="role" value={newUser.role || 'passenger'} onChange={(e) => handleInputChange(e, false)} className="mt-1 form-select block w-full border-gray-300 rounded-md shadow-sm">
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {/* Add password field if needed for creation */}
          {/* <div>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" onChange={(e) => handleInputChange(e, false)} required />
          </div> */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeAddModal} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary inline-flex items-center">
              <PlusCircle size={16} className="mr-1"/> Add User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit User">
        {editingUser && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" name="firstName" id="editFirstName" value={editingUser.firstName || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-input block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" name="lastName" id="editLastName" value={editingUser.lastName || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-input block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="editEmail" value={editingUser.email || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-input block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="editRole" className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" id="editRole" value={editingUser.role || 'passenger'} onChange={(e) => handleInputChange(e, true)} className="mt-1 form-select block w-full border-gray-300 rounded-md shadow-sm">
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* Add status field if needed */}
            {/* <div>
              <label htmlFor="editStatus">Status</label>
              <select name="status" id="editStatus" value={editingUser.status || 'active'} onChange={(e) => handleInputChange(e, true)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div> */}
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={closeEditModal} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary inline-flex items-center">
                 <Save size={16} className="mr-1"/> Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;