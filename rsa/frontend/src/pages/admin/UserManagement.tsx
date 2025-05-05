import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Users, Search, Edit, Trash2, UserPlus, Filter } from 'react-feather';

// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

// Mock data for users
const mockUsers = [
  { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'passenger', status: 'active' },
  { id: 'u2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'passenger', status: 'active' },
  { id: 'u3', firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@example.com', role: 'driver', status: 'active' },
  { id: 'u4', firstName: 'Emily', lastName: 'Davis', email: 'emily.d@example.com', role: 'passenger', status: 'inactive' },
  { id: 'u5', firstName: 'Michael', lastName: 'Wilson', email: 'michael.w@example.com', role: 'driver', status: 'active' },
  { id: 'u6', firstName: 'Sarah', lastName: 'Brown', email: 'sarah.b@example.com', role: 'admin', status: 'active' },
  { id: 'u7', firstName: 'David', lastName: 'Miller', email: 'david.m@example.com', role: 'passenger', status: 'active' },
  { id: 'u8', firstName: 'Lisa', lastName: 'Taylor', email: 'lisa.t@example.com', role: 'passenger', status: 'inactive' },
];

const UserManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [users, setUsers] = React.useState(mockUsers);
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  
  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = fullName.includes(term) || email.includes(term);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleEditUser = (userId: string) => {
    alert(`Edit user with ID: ${userId}. This is just a demo.`);
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="admin" />
      </React.Suspense>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all users across the platform
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="btn btn-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">Users</h2>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
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
              
              <div className="flex items-center space-x-2">
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
              </div>
              
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'driver' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-secondary py-1 px-3 text-sm" disabled>
                Previous
              </button>
              <button className="btn btn-secondary py-1 px-3 text-sm" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;