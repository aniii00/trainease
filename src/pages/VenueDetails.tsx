import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/types/venue";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Star, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const VenueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFacilities, setExpandedFacilities] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching venue:", error);
      } else {
        setVenue(data);
      }
      setLoading(false);
    };

    fetchVenue();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
          <p className="text-lg font-medium text-gray-600">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-6">
            The venue you're looking for doesn't exist or may have been removed.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  const images = venue.images?.length ? venue.images : ["/placeholder.svg"];
  const facilities = expandedFacilities 
    ? venue.facilities 
    : venue.facilities?.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 w-full overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {images.map((img, index) => (
              <CarouselItem key={index}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full relative"
                >
                  <img
                    src={img}
                    alt={`${venue.name} image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 bg-white/90 hover:bg-white" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 bg-white/90 hover:bg-white" />
            </>
          )}
        </Carousel>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Venue Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-lg">{venue.address}</span>
                </div>
              </div>
              
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Book Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {venue.description || `Welcome to ${venue.name}, a premier sports venue located in ${venue.location}.`}
                </p>
              </motion.section>

              {/* Features Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Opening Hours</h3>
                      <p className="text-gray-600">
                        {venue.opening_hours || "Kabhi bhi ajao"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Capacity</h3>
                      <p className="text-gray-600">
                        {venue.capacity ? `${venue.capacity} people` : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Facilities Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Facilities</h2>
                <div className="space-y-3">
                  {facilities?.map((facility, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                  
                  {venue.facilities && venue.facilities.length > 5 && (
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:bg-blue-50 mt-3"
                      onClick={() => setExpandedFacilities(!expandedFacilities)}
                    >
                      {expandedFacilities ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show All Facilities
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.section>
            </div>

            {/* Right Column - Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Rating Card */}
              {venue.rating && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(venue.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-700 font-medium">
                      {venue.rating.toFixed(1)} ({venue.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Info Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hours</p>
                      <p className="font-medium">
                        {venue.opening_hours || "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">
                        {venue.capacity ? `${venue.capacity} people` : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <p className="text-gray-600">
                  {venue.contact_info || "Contact venue for more information"}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VenueDetails;
