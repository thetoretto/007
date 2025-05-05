import { ReactNode, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader } from 'lucide-react';
import { User } from '../../types';

interface CreateButtonProps {
  label: string;
  to: string;
  icon?: ReactNode;
}

interface DashboardLayoutProps {
  title: string;
  user: User;
  headerActions?: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  createButton?: CreateButtonProps;
  isLoading?: boolean;
  error?: string | null;
};

export const DashboardLayout = ({
  title,
  user,
  headerActions,
  mainContent,
  sidebarContent,
  createButton,
  isLoading = false,
  error = null
}: DashboardLayoutProps) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="md:flex md:items-center md:justify-between mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            {user && `Welcome back, ${user.firstName} ${user.lastName}`}
          </p>
        )}
      </div>
      
      <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
        {headerActions}
        {createButton && (
          <Link 
            to={createButton.to} 
            className="btn btn-primary inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              createButton.icon || <Plus className="h-4 w-4 mr-2" />
            )}
            {createButton.label}
          </Link>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Suspense fallback={
          <div className="flex items-center justify-center h-32">
            <Loader className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        }>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            mainContent
          )}
        </Suspense>
      </div>
      <div className="space-y-6">{sidebarContent}</div>
    </div>
  </div>
);