
import { BookingStatus, UIBookingStatus } from './venue';

export interface Booking {
  id: string;
  user_id: string;
  venue_id: string;
  sport_id: string;
  slot_id: string | null;
  slot_time: string;
  status: string; // Using string type to accommodate both BookingStatus and UIBookingStatus
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
  amount: number;
  // Nested relationships
  venues?: { 
    name: string;
    location: string;
    [key: string]: any;
  };
  sports?: {
    name: string;
    [key: string]: any;
  };
  profiles?: {
    email: string;
    [key: string]: any;
  };
}
