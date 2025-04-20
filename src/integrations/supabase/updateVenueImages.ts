
import { supabase } from './client';

export const updateVenueImages = async () => {
  const venues = [
    {
      id: 'YOUR_BOX_CRICKET_VENUE_ID_1', // Replace with actual venue ID from Supabase
      image: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3'  // Green grass, good for cricket
    },
    {
      id: 'YOUR_BOX_FOOTBALL_VENUE_ID_1', // Replace with actual venue ID from Supabase
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'  // Green landscape, good for football
    },
    {
      id: 'YOUR_BOX_CRICKET_VENUE_ID_2', // Replace with actual venue ID from Supabase
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22'  // Lights, good for evening sports
    }
  ];

  for (const venue of venues) {
    const { error } = await supabase
      .from('venues')
      .update({ image: venue.image })
      .eq('id', venue.id);

    if (error) {
      console.error(`Error updating venue ${venue.id}:`, error);
    }
  }
};
