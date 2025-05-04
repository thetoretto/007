import { Link } from 'react-router-dom';

type QuickAction = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

export const QuickActions = ({ actions }: { actions: QuickAction[] }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
    </div>
    <div className="p-4 sm:px-6 space-y-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.to}
          className="btn btn-secondary w-full flex items-center justify-center"
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  </div>
);