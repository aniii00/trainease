import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type Props = {
  venueId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function VenueDetailsModal({ venueId, isOpen, onClose }: Props) {
  const [venue, setVenue] = useState<any>(null);

  useEffect(() => {
    if (!venueId || !isOpen) return;

    const fetchVenue = async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", venueId)
        .single();

      if (error) {
        toast.error("Failed to fetch venue details");
        console.error(error);
      } else {
        setVenue(data);
      }
    };

    fetchVenue();
  }, [venueId, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <Dialog.Title className="text-xl font-semibold mb-2">
            {venue?.name || "Venue Details"}
          </Dialog.Title>

          <p className="text-gray-600">{venue?.address}</p>
          <p className="text-gray-600">{venue?.location}</p>

          {venue?.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {venue.images.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="rounded-lg w-full h-40 object-cover"
                />
              ))}
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mt-4">Amenities</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Changing Rooms</li>
              <li>Drinking Water</li>
              <li>Parking</li>
              {/* Add dynamic amenities later */}
            </ul>

            <h3 className="text-lg font-bold mt-4">Rules</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Non-marking shoes required</li>
              <li>No food or drinks on court</li>
              <li>Arrive 10 minutes early</li>
              {/* Add dynamic rules later */}
            </ul>
          </div>

          <div className="text-right pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
