import '../../index.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBookingStore, BookingWithDetails } from '../../store/bookingStore'; // Corrected import
import Navbar from '../../components/common/Navbar';
import TripTicket from '../../components/trips/TripTicket'; // We'll create this next
import { ArrowLeft, Printer, Share2 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="text-lg text-red-600 mt-20">Error: {error}</p>
        <Link to="/passenger/trips" className="mt-4 btn btn-primary">
          Back to My Trips
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="text-lg text-gray-600 mt-20">No booking details found for this trip.</p>
        <Link to="/passenger/trips" className="mt-4 btn btn-primary">
          Back to My Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="mb-6 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Trips
        </button>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                Trip Details
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="btn btn-outline btn-sm inline-flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1.5" /> Print
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-outline btn-sm inline-flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-1.5" /> Share
                </button>
              </div>
            </div>
            
            <TripTicket booking={booking} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsPage;