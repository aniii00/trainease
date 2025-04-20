import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { VenueCard } from "@/components/venue-card";
import { supabase } from "@/integrations/supabase/client";
import type { Venue, Sport } from "@/types/venue";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { WavesIcon } from "@/utils/iconMapping";

export default function Venue() {
  const [searchParams] = useSearchParams();
  const initialSportId = searchParams.get('sportId') || undefined;
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*');
        
        if (venueError) throw venueError;
        
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');
        
        if (sportError) throw sportError;
        
        setVenues(venueData || []);
        setSports(sportData || []);
        
        if (initialSportId) {
          const sport = sportData?.find(s => s.id === initialSportId);
          if (sport) {
            setSelectedSport(sport);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load venues and sports");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [initialSportId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <WavesIcon className="absolute top-0 left-0 w-full h-full text-blue-200 rotate-180" />
        <WavesIcon className="absolute bottom-0 right-0 w-full h-full text-blue-200" />
      </div>
      
      <PageHeader 
        title={selectedSport ? `${selectedSport.name} Venues` : "All Venues"}
        subtitle={selectedSport 
          ? `Find venues offering ${selectedSport.name}`
          : "Browse all our sports venues across locations"
        }
        showBackButton={!!selectedSport}
        className="relative z-10 bg-white/50 backdrop-blur-sm"
      />
      
      {isLoading ? (
        <div className="text-center py-12 relative z-10">
          <h3 className="text-xl font-semibold mb-2">Loading venues...</h3>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12 relative z-10">
          <h3 className="text-xl font-semibold mb-2">No venues found</h3>
          <p className="text-gray-500">Try adjusting your filters to find more venues</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 relative z-10"
        >
          {venues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VenueCard 
                venue={venue} 
                selectedSportId={selectedSport?.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

