
export interface Venue {
  id: string;
  name: string;
  location: string;
  address: string;
  images: string[]; // Ensure this is always an array
  image?: string | null; // Keep for backward compatibility
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: string;
  venue_id: string;
  sport_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenuePricing {
  id: string;
  venue_id: string;
  day_group: string;
  is_morning: boolean;
  time_range: string;
  price: number;
  per_duration: string;
  created_at: string;
  updated_at: string;
}

// Update this to match Supabase schema expectations
export type BookingStatus = "confirmed" | "cancelled";

// Define a UI-only status type for display purposes
export type UIBookingStatus = "confirmed" | "cancelled" | "completed";
