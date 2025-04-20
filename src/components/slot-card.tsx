
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Slot, Venue, Sport } from "@/types/venue";
import { TimeIcon, PriceIcon } from "@/utils/iconMapping";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn, formatDateString } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatTimeIST } from "@/lib/timezone-utils";

interface SlotCardProps {
  slot: Slot;
  className?: string;
}

export function SlotCard({ slot, className }: SlotCardProps) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if the slot is actually available by directly querying the database
  const checkSlotAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from("slots")
        .select("available")
        .eq("id", slot.id)
        .single();
      
      if (error) throw error;
      
      // Update the local state with the latest availability
      setIsBooked(!data.available);
      
      // Update the slot object if needed
      if (slot.available !== data.available) {
        slot.available = data.available;
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
    }
  };
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Initial state from the slot prop
        setIsBooked(!slot.available);
        
        // Check actual availability from database
        await checkSlotAvailability();
        
        // Get venue info
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("*")
          .eq("id", slot.venue_id)
          .single();

        if (venueError) throw venueError;
        setVenue(venueData);

        // Get sport info
        const { data: sportData, error: sportError } = await supabase
          .from("sports")
          .select("*")
          .eq("id", slot.sport_id)
          .single();

        if (sportError) throw sportError;
        setSport(sportData);

        // Subscribe to both slot and booking changes for this slot
        const slotChannel = supabase
          .channel("slot-updates")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "slots",
              filter: `id=eq.${slot.id}`,
            },
            (payload: any) => {
              console.log("Slot update received:", payload);
              setIsBooked(!payload.new.available);
              slot.available = payload.new.available;
            }
          )
          .subscribe();

        // Subscribe to booking changes for potential status changes
        const bookingChannel = supabase
          .channel("booking-updates")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "bookings",
              filter: `slot_id=eq.${slot.id}`,
            },
            async (payload: any) => {
              console.log("Booking update received:", payload);
              // Refresh the slot availability when bookings change
              await checkSlotAvailability();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(slotChannel);
          supabase.removeChannel(bookingChannel);
        };
      } catch (error) {
        console.error("Error fetching slot details:", error);
        toast.error("Error loading slot details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [slot.venue_id, slot.sport_id, slot.id]);

  const handleBookClick = () => {
    if (!user) {
      toast.error("You must be logged in to book a slot");
      navigate("/auth", { state: { redirectTo: `/booking?slotId=${slot.id}` } });
      return;
    }
    
    navigate(`/booking?slotId=${encodeURIComponent(slot.id)}`);
  };

  if (isLoading) {
    return (
      <Card
        className={cn(
          "transition-all hover:shadow-lg rounded-2xl animate-pulse",
          className
        )}
      >
        <CardContent className="p-5">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!venue || !sport) return null;

  let formattedDate;
  try {
    formattedDate = formatDateString(`${slot.date}T00:00:00`, "EEE, dd MMM yyyy");
  } catch (error) {
    console.error("Date formatting error:", error, slot.date);
    formattedDate = slot.date;
  }

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg rounded-2xl",
        isBooked ? "opacity-75" : "hover:scale-102",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{sport?.name}</h3>
            <p className="text-sm text-gray-500">{venue?.name}</p>
          </div>
          <div className="flex items-center text-sports-orange font-semibold bg-sports-lightOrange/50 px-3 py-1 rounded-full">
            <PriceIcon className="h-4 w-4 mr-1" />
            <span>{slot.price}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium">{formattedDate}</p>
          <div className="flex items-center text-gray-500">
            <TimeIcon className="h-4 w-4 mr-1 text-sports-blue" />
            <span className="text-sm">
              {formatTimeIST(slot.start_time)} - {formatTimeIST(slot.end_time)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {isBooked ? (
            <Badge
              variant="secondary"
              className="w-full justify-center py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              Already Booked
            </Badge>
          ) : (
            <Button 
              onClick={handleBookClick}
              className="w-full rounded-xl shadow-sm hover:shadow-md bg-gradient-to-r from-sports-blue to-sports-blue/90 hover:scale-102 transition-all"
            >
              Book Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
