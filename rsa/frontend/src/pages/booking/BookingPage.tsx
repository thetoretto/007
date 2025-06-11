import React from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleEnhancedBooking from '../../components/booking/SimpleEnhancedBooking';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SimpleEnhancedBooking
      onClose={() => navigate(-1)}
    />
  );
};

export default BookingPage;
