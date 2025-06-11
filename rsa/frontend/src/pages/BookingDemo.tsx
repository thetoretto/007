import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StreamlinedBooking from '../components/booking/StreamlinedBooking';

const BookingDemo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light to-surface-light-alt dark:from-surface-dark dark:to-surface-dark-alt">
      {/* Header */}
      <div className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-secondary btn-sm flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary">
                  Book Your Trip
                </h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary">
                  Simple, fast, and secure booking process
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <StreamlinedBooking />
      </div>
    </div>
  );
};

export default BookingDemo;