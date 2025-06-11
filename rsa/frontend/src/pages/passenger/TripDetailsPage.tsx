import '../../index.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBookingStore, BookingWithDetails } from '../../store/bookingStore';
import TripTicket from '../../components/trips/TripTicket';
import { ArrowLeft, Printer, Share2, Ticket } from 'lucide-react';

const TripDetailsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { fetchBookingById, isLoading: storeLoading, error: storeError } = useBookingStore();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  // Use local loading/error states or combine with store's, for simplicity using local for initial fetch effect
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setError('Trip ID is missing.');
      setLoading(false);
      return;
    }

    const loadBooking = async () => {
      setLoading(true);
      setError(null);
      const fetchedBooking = await fetchBookingById(tripId);
      if (fetchedBooking) {
        setBooking(fetchedBooking);
      } else {
        setError(storeError || 'Trip not found.'); // Use storeError if available
      }
      setLoading(false);
    };

    loadBooking();
  }, [tripId, fetchBookingById, storeError]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (booking && navigator.share) {
      try {
        await navigator.share({
          title: `Trip Details: ${booking.route?.origin.name} to ${booking.route?.destination.name}`,
          text: `Check out my trip details for booking ID ${booking.id}.`,
          url: window.location.href,
        });
        console.log('Trip details shared successfully');
      } catch (err) {
        console.error('Error sharing trip details:', err);
        alert('Could not share trip details. Your browser might not support this feature or an error occurred.');
      }
    } else if (booking) {
      // Fallback for browsers that don't support navigator.share
      // Or provide a copy-to-clipboard functionality
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Trip link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link: ', err);
        alert('Could not copy trip link. Please copy it manually.');
      }
    }
  };

  if (loading) {
    return (
      <div className="driver-dashboard">
        <div className="driver-loading-card">
          <div className="icon-badge icon-badge-lg bg-primary-light text-primary mx-auto mb-4">
            <Ticket className="h-6 w-6" />
          </div>
          <p className="text-light-secondary dark:text-dark-secondary">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-dashboard">
        <div className="driver-loading-card">
          <div className="icon-badge icon-badge-lg bg-error-light text-error mx-auto mb-4">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
            Error Loading Trip
          </h3>
          <p className="text-light-secondary dark:text-dark-secondary mb-6">
            {error}
          </p>
          <Link to="/passenger/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="driver-dashboard">
        <div className="driver-loading-card">
          <div className="icon-badge icon-badge-lg bg-warning-light text-warning mx-auto mb-4">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
            Trip Not Found
          </h3>
          <p className="text-light-secondary dark:text-dark-secondary mb-6">
            No booking details found for this trip.
          </p>
          <Link to="/passenger/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-ghost btn-sm flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    Trip Details
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Booking ID: {booking.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handlePrint}
                className="btn btn-secondary flex items-center gap-2 px-4 py-3"
              >
                <Printer className="h-5 w-5" />
                Print
              </button>
              <button
                onClick={handleShare}
                className="btn btn-outline flex items-center gap-2 px-4 py-3"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">
        <div className="driver-metric-card">
          <TripTicket booking={booking} />
        </div>
      </main>
    </div>
  );
};

export default TripDetailsPage;