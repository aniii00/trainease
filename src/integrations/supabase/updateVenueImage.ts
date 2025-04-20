
import { supabase } from './client';

export const updateVenueImage = async () => {
  const venueId = 'a1072301-61eb-47bf-bf58-6951c3c77ad2';
  const imageUrl = '/lovable-uploads/0356fc99-b839-4881-b57d-6d149b049fad.png';

  try {
    const { error } = await supabase
      .from('venues')
      .update({ image: imageUrl })
      .eq('id', venueId);

    if (error) {
      console.error('Error updating venue image:', error);
      throw error;
    }

    console.log('Successfully updated venue image');
  } catch (error) {
    console.error('Failed to update venue image:', error);
    throw error;
  }
};

// Execute the update
updateVenueImage();
