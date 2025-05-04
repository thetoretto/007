import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Plus } from 'lucide-react';

type DashboardLayoutProps = {
  title: string;
  user: { firstName: string; lastName: string };
  headerActions?: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  createButton?: {
    label: string;
    to: string;
  };
};

export const DashboardLayout = ({
  title,
  user,
  headerActions,
  mainContent,
  sidebarContent,
  createButton
}: DashboardLayoutProps) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="md:flex md:items-center md:justify-between mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {user && `Welcome back, ${user.firstName} ${user.lastName}`}
        </p>
      </div>
      
      <div className="mt-4 flex md:mt-0 md:ml-4">
        {headerActions}
        {createButton && (
          <Link to={createButton.to} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            {createButton.label}
          </Link>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">{mainContent}</div>
      <div>{sidebarContent}</div>
    </div>
  </div>
);