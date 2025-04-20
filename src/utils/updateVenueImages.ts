import { supabase } from "@/integrations/supabase/client";

export async function updateVenueImages(venueId: string, imageUrls: string[]) {
  try {
    const { data, error } = await supabase
      .from('venues')
      .update({ 
        images: imageUrls,
        image: imageUrls[0] || null
      })
      .eq('id', venueId)
      .select();

    if (error) {
      console.error('❌ Error updating venue images:', error);
      throw error;
    }

    console.log('✅ Venue images updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in updateVenueImages:', error);
    throw error;
  }
}

// 🔁 Execute the update
const venueId = '3bd6ae09-610b-40d8-ac37-070f1730b70b';
const imageUrls = [
  'https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/5309630f-56b0-47ad-bad2-b020901d470a.jpeg',
  'https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/WhatsApp%20Image%202025-04-19%20at%206.27.17%20PM.jpeg',
  'https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/WhatsApp%20Image%202025-04-19%20at%206.27.17%20PM%20(1).jpeg'
];

updateVenueImages(venueId, imageUrls)
  .then(() => console.log('🎉 Successfully updated venue images'))
  .catch(error => console.error('⚠️ Failed to update venue images:', error));

