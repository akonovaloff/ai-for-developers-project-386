import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminEventTypes from './pages/admin/AdminEventTypes';
import AdminBookings from './pages/admin/AdminBookings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book/:eventTypeId" element={<BookingPage />} />
        <Route path="/booking/:bookingId" element={<ConfirmationPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminEventTypes />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
