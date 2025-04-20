import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format, addDays, parse, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedSlotCard } from "@/components/animated-slot-card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/utils/iconMapping";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Venue, Sport, Slot, VenuePricing } from "@/types/venue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Slots() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const sportId = searchParams.get('sportId');
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*');
        
        if (venueError) throw venueError;
        setVenues(venueData || []);
        
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');
        
        if (sportError) throw sportError;
        setSports(sportData || []);
        
        if (venueId) {
          const venue = venueData?.find(v => v.id === venueId) || null;
          setSelectedVenue(venue);
        }
        
        if (sportId) {
          const sport = sportData?.find(s => s.id === sportId) || null;
          setSelectedSport(sport);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load venues and sports");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [venueId, sportId]);
  
  useEffect(() => {
    const fetchAvailableSports = async () => {
      if (!selectedVenue) {
        setAvailableSports([]);
        return;
      }
      
      try {
        const { data: venueSportsData, error: venueSportsError } = await supabase
          .from('venue_sports')
          .select('sport_id')
          .eq('venue_id', selectedVenue.id);
        
        if (venueSportsError) throw venueSportsError;
        
        if (venueSportsData && venueSportsData.length > 0) {
          const sportIds = venueSportsData.map(vs => vs.sport_id);
          
          const availableSportsList = sports.filter(sport => sportIds.includes(sport.id));
          setAvailableSports(availableSportsList);
          
          if (selectedSport && !sportIds.includes(selectedSport.id)) {
            setSelectedSport(availableSportsList.length > 0 ? availableSportsList[0] : null);
          }
        } else {
          setAvailableSports([]);
        }
      } catch (error) {
        console.error("Error fetching available sports:", error);
        toast.error("Failed to load available sports for this venue");
      }
    };
    
    fetchAvailableSports();
  }, [selectedVenue, sports, selectedSport]);
  
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedVenue || !selectedSport) {
        setSlots([]);
        return;
      }
      
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const { data: existingSlots, error: slotsError } = await supabase
          .from('slots')
          .select('*')
          .eq('venue_id', selectedVenue.id)
          .eq('sport_id', selectedSport.id)
          .eq('date', formattedDate);
        
        if (slotsError) throw slotsError;
        
        if (existingSlots && existingSlots.length > 0) {
          console.log("Found existing slots:", existingSlots);
          setSlots(existingSlots);
        } else {
          console.log("No existing slots found, generating new ones");
          
          const { data: timingsData, error: timingsError } = await supabase
            .from('venue_timings')
            .select('*')
            .eq('venue_id', selectedVenue.id);
          
          if (timingsError) throw timingsError;
          
          if (!timingsData || timingsData.length === 0) {
            console.log("No venue timings found, creating default ones");
            await createDefaultVenueTimings(selectedVenue.id);
          }
          
          const { data: pricingData, error: pricingError } = await supabase
            .from('venue_pricing')
            .select('*')
            .eq('venue_id', selectedVenue.id);
          
          if (pricingError) throw pricingError;
          
          if (!pricingData || pricingData.length === 0) {
            console.log("No venue pricing found, creating default ones");
            await createDefaultVenuePricing(selectedVenue.id);
          }
          
          const generatedSlots = await generateSlotsForVenueAndDate(
            selectedVenue.id, 
            selectedSport.id, 
            formattedDate
          );
          
          if (generatedSlots && generatedSlots.length > 0) {
            setSlots(generatedSlots);
          } else {
            setSlots([]);
          }
        }
      } catch (error) {
        console.error("Error in fetchSlots:", error);
        toast.error("Failed to load available slots");
      }
    };

    const channel = supabase
      .channel('slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slots'
        },
        (payload) => {
          console.log('Slot change detected:', payload);
          fetchSlots();
        }
      )
      .subscribe();

    fetchSlots();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedVenue, selectedSport, date]);
  
  const createDefaultVenueTimings = async (venueId: string) => {
    try {
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const timingsToInsert = [];
      const now = new Date().toISOString();
      
      for (const day of daysOfWeek) {
        timingsToInsert.push({
          id: crypto.randomUUID(),
          venue_id: venueId,
          day_of_week: day,
          start_time: '06:00:00',
          end_time: '12:00:00',
          is_morning: true,
          created_at: now,
          updated_at: now
        });
        
        timingsToInsert.push({
          id: crypto.randomUUID(),
          venue_id: venueId,
          day_of_week: day,
          start_time: '12:00:00',
          end_time: '23:00:00',
          is_morning: false,
          created_at: now,
          updated_at: now
        });
      }
      
      const { error } = await supabase
        .from('venue_timings')
        .insert(timingsToInsert);
      
      if (error) throw error;
      
      console.log("Created default venue timings");
      
    } catch (error) {
      console.error("Error creating default venue timings:", error);
      toast.error("Failed to create default venue timings");
    }
  };
  
  const createDefaultVenuePricing = async (venueId: string) => {
    try {
      const now = new Date().toISOString();
      const pricingToInsert = [
        {
          id: crypto.randomUUID(),
          venue_id: venueId,
          day_group: 'monday-thursday',
          is_morning: true,
          time_range: '6-12',
          price: 500,
          per_duration: '30 minutes',
          created_at: now,
          updated_at: now
        },
        {
          id: crypto.randomUUID(),
          venue_id: venueId,
          day_group: 'monday-thursday',
          is_morning: false,
          time_range: '12-23',
          price: 700,
          per_duration: '30 minutes',
          created_at: now,
          updated_at: now
        },
        
        {
          id: crypto.randomUUID(),
          venue_id: venueId,
          day_group: 'friday-sunday',
          is_morning: true,
          time_range: '6-12',
          price: 700,
          per_duration: '30 minutes',
          created_at: now,
          updated_at: now
        },
        {
          id: crypto.randomUUID(),
          venue_id: venueId,
          day_group: 'friday-sunday',
          is_morning: false,
          time_range: '12-23',
          price: 900,
          per_duration: '30 minutes',
          created_at: now,
          updated_at: now
        }
      ];
      
      const { error } = await supabase
        .from('venue_pricing')
        .insert(pricingToInsert);
      
      if (error) throw error;
      
      console.log("Created default venue pricing");
      
    } catch (error) {
      console.error("Error creating default venue pricing:", error);
      toast.error("Failed to create default venue pricing");
    }
  };
  
  const generateSlotsForVenueAndDate = async (
    venueId: string, 
    sportId: string, 
    formattedDate: string
  ): Promise<Slot[]> => {
    try {
      const dayOfWeek = format(new Date(formattedDate), 'EEEE').toLowerCase();
      
      const { data: timingsData, error: timingsError } = await supabase
        .from('venue_timings')
        .select('*')
        .eq('venue_id', venueId)
        .eq('day_of_week', dayOfWeek);
      
      if (timingsError) throw timingsError;
      
      if (!timingsData || timingsData.length === 0) {
        console.log("No venue timings found, creating default ones");
        const now = new Date().toISOString();
        const defaultTimings = [
          {
            id: crypto.randomUUID(),
            venue_id: venueId,
            day_of_week: dayOfWeek,
            start_time: '06:00:00',
            end_time: '12:00:00',
            is_morning: true,
            created_at: now,
            updated_at: now
          },
          {
            id: crypto.randomUUID(),
            venue_id: venueId,
            day_of_week: dayOfWeek,
            start_time: '12:00:00',
            end_time: '23:00:00',
            is_morning: false,
            created_at: now,
            updated_at: now
          }
        ];
        
        const { error: insertTimingsError } = await supabase
          .from('venue_timings')
          .insert(defaultTimings);
        
        if (insertTimingsError) throw insertTimingsError;
        
        timingsData.push(...defaultTimings);
      }
      
      const { data: pricingData, error: pricingError } = await supabase
        .from('venue_pricing')
        .select('*')
        .eq('venue_id', venueId);
      
      if (pricingError) throw pricingError;
      
      if (!pricingData || pricingData.length === 0) {
        console.log("No venue pricing found, creating default ones");
        const now = new Date().toISOString();
        const defaultPricing = [
          {
            id: crypto.randomUUID(),
            venue_id: venueId,
            day_group: 'monday-sunday',
            time_range: '6-23',
            is_morning: true,
            price: 500,
            per_duration: '30 minutes',
            created_at: now,
            updated_at: now
          }
        ];
        
        const { error: insertPricingError } = await supabase
          .from('venue_pricing')
          .insert(defaultPricing);
        
        if (insertPricingError) throw insertPricingError;
        
        pricingData.push(...defaultPricing);
      }
      
      const slotsToInsert: Omit<Slot, 'id'>[] = [];
      
      for (const timing of timingsData) {
        let currentTime = parse(timing.start_time, 'HH:mm:ss', new Date());
        const endTime = parse(timing.end_time, 'HH:mm:ss', new Date());
        
        while (currentTime < endTime) {
          const slotStartTime = format(currentTime, 'HH:mm:ss');
          currentTime = addMinutes(currentTime, 30);
          const slotEndTime = format(currentTime, 'HH:mm:ss');
          
          const price = getSlotPrice(
            pricingData || [], 
            dayOfWeek, 
            slotStartTime,
            timing.is_morning
          );
          
          slotsToInsert.push({
            venue_id: venueId,
            sport_id: sportId,
            date: formattedDate,
            start_time: slotStartTime,
            end_time: slotEndTime,
            price,
            available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      
      if (slotsToInsert.length === 0) {
        return [];
      }
      
      const BATCH_SIZE = 10;
      const insertedSlots: Slot[] = [];
      
      for (let i = 0; i < slotsToInsert.length; i += BATCH_SIZE) {
        const batch = slotsToInsert.slice(i, i + BATCH_SIZE);
        
        const { data, error } = await supabase
          .from('slots')
          .insert(batch as any)
          .select();
        
        if (error) {
          console.error("Slot insertion error:", error);
          toast.error("Failed to generate some slots");
        } else if (data) {
          insertedSlots.push(...data);
        }
      }
      
      return insertedSlots;
    } catch (error) {
      console.error("Slot generation error:", error);
      toast.error("Failed to generate slots");
      return [];
    }
  };
  
  const getSlotPrice = (
    pricingData: VenuePricing[], 
    dayOfWeek: string, 
    slotTime: string,
    isMorning: boolean
  ): number => {
    const hour = parseInt(slotTime.split(':')[0]);
    
    const filteredPricing = pricingData.filter(p => p.is_morning === isMorning);
    
    if (dayOfWeek === 'sunday') {
      if (hour >= 5 && hour < 7) return 650;
      if (hour >= 7 && hour < 18) return 650;
      if (hour >= 18 && hour < 23) return 700;
    } else {
      if (hour >= 16 && hour < 18) return 600;
      if (hour >= 18 && hour < 23) return 650;
    }
    
    return 600;
  };
  
  const isTimeInRange = (time: string, range: string): boolean => {
    const [rangeStart, rangeEnd] = range.split('-');
    const timeNum = parseInt(time.split(':')[0]);
    const startNum = parseInt(rangeStart);
    let endNum = parseInt(rangeEnd);
    
    if (endNum < startNum) {
      endNum += 24;
    }
    
    return timeNum >= startNum && timeNum < endNum;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#F2FCE2] via-[#FEF7CD] to-[#FEC6A1] p-6"
    >
      <PageHeader 
        title="Available Slots" 
        subtitle={selectedVenue ? `at ${selectedVenue.name}` : "Select a venue and sport"}
        showBackButton
        backTo="/venue"
        className="mb-8"
      />
      
      <motion.div 
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <motion.div 
          className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Venue</label>
          <Select 
            value={selectedVenue?.id} 
            onValueChange={(value) => {
              const venue = venues.find(v => v.id === value);
              setSelectedVenue(venue || null);
            }}
          >
            <SelectTrigger className="bg-[#E5DEFF]/50 border-[#9b87f5]/30">
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent className="bg-white/80 backdrop-blur-lg">
              {venues.map((venue) => (
                <SelectItem 
                  key={venue.id} 
                  value={venue.id}
                  className="hover:bg-[#E5DEFF]/50"
                >
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
        
        <motion.div 
          className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Sport</label>
          <Select 
            value={selectedSport?.id} 
            onValueChange={(value) => {
              const sport = sports.find(s => s.id === value);
              setSelectedSport(sport || null);
            }}
            disabled={!selectedVenue || availableSports.length === 0}
          >
            <SelectTrigger className="bg-[#FDE1D3]/50 border-[#FF7A00]/30">
              <SelectValue placeholder="Select a sport" />
            </SelectTrigger>
            <SelectContent className="bg-white/80 backdrop-blur-lg">
              {availableSports.map((sport) => (
                <SelectItem 
                  key={sport.id} 
                  value={sport.id}
                  className="hover:bg-[#FDE1D3]/50"
                >
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
        
        <motion.div 
          className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#D3E4FD]/50 border-[#0070DC]/30"
                disabled={!selectedVenue || !selectedSport}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#0070DC]" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white/80 backdrop-blur-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => setDate(newDate || new Date())}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date > addDays(new Date(), 30)}
                className="rounded-lg border shadow-lg"
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      </motion.div>
      
      {isLoading ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Loading...</h3>
        </motion.div>
      ) : selectedVenue && selectedSport ? (
        slots.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <motion.div
              className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#F2FCE2]/30 via-transparent to-[#FEC6A1]/30 opacity-50 rounded-3xl blur-3xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            {slots.map((slot, index) => (
              <AnimatedSlotCard 
                key={slot.id} 
                slot={slot}
                index={index}
                className="bg-white/60 backdrop-blur-lg shadow-xl rounded-2xl"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12 bg-white/50 backdrop-blur-lg rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-700">No slots available</h3>
            <p className="text-gray-500">Try selecting a different date or sport</p>
          </motion.div>
        )
      ) : (
        <motion.div 
          className="text-center py-12 bg-white/50 backdrop-blur-lg rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Select a venue and sport</h3>
          <p className="text-gray-500">Choose a venue and sport to view available slots</p>
        </motion.div>
      )}
    </motion.div>
  );
}
