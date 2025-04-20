
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPinIcon, ClockIcon, StarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Venue, Sport, Slot } from "@/types/venue";
import { toast } from "@/components/ui/sonner";

export function SmartRecommendations() {
  const { user } = useAuth();
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get user preferences
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        // Get nearby venues (for now, just get latest 2)
        const { data: venuesData } = await supabase
          .from('venues')
          .select('*')
          .limit(2);
        
        setNearbyVenues(venuesData || []);

        // Get favorite sports if user has preferences
        if (preferences?.favorite_sports?.length) {
          const { data: sportsData } = await supabase
            .from('sports')
            .select('*')
            .in('id', preferences.favorite_sports);
          
          setFavoriteSports(sportsData || []);

          // Get available slots for favorite sports
          const { data: slotsData } = await supabase
            .from('slots')
            .select('*')
            .in('sport_id', preferences.favorite_sports)
            .eq('available', true)
            .gte('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: true })
            .limit(2);
          
          setAvailableSlots(slotsData || []);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  // Only render if user is signed in
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Smart Recommendations</h2>
      
      {/* Near Your Location */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-sports-lightBlue to-sports-lightBlue/70 shadow-sm">
            <MapPinIcon className="h-5 w-5 text-sports-blue" />
          </div>
          <h3 className="text-lg font-semibold">Near Your Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearbyVenues.length > 0 ? (
            nearbyVenues.map(venue => (
              <Link key={venue.id} to={`/slots?venueId=${venue.id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{venue.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{venue.location}, {venue.address}</p>
                    <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg shadow-sm hover:shadow-md">
                      View Slots
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">No venues found near your location</p>
          )}
        </div>
      </div>
      
      {/* For Your Favorite Sports */}
      {favoriteSports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-sports-lightOrange to-sports-lightOrange/70 shadow-sm">
              <StarIcon className="h-5 w-5 text-sports-orange" />
            </div>
            <h3 className="text-lg font-semibold">For Your Favorite Sports</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSlots.map(slot => (
              <Link key={slot.id} to={`/booking?slotId=${slot.id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{
                      favoriteSports.find(s => s.id === slot.sport_id)?.name
                    }</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <ClockIcon className="h-4 w-4 mr-1 text-sports-blue" />
                      {slot.date} • {slot.start_time} - {slot.end_time}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-medium text-sports-orange">₹{slot.price}</span>
                      <Button size="sm" className="rounded-lg shadow-sm hover:shadow-md">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
