import { PageHeader } from "@/components/ui/page-header";
import { SportCard } from "@/components/sport-card";
import { VenueCard } from "@/components/venue-card";
import { SmartRecommendations } from "@/components/smart-recommendations";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { SportBackground } from "@/components/ui/sport-background";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sport, Venue } from "@/types/venue";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingQuotes } from "@/components/floating-quotes";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, slideIn, scaleIn, magneticButton } from "@/utils/animations";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .limit(4);

        if (venueError) throw venueError;

        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');

        if (sportError) throw sportError;

        setVenues(venueData || []);
        setSports(sportData || []);
      } catch (error) {
        console.error("Error fetching home data:", error);
        toast.error("Failed to load home page data");
      } finally {
        setIsLoading(false);
      }
    };

    setImageUrls([
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/banner-images/52497cbce5317a86ca9ca1571bdc3443.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/8a8deeb0809e534ecad138a22389e1ad.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/c58154f150b31f85331996589079cbe2.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/5f51a1cee2aa31d69aad953432b9f088.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/9e730ba6b383eafb35b15c2524847618.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/banner-images/69790772b39fcd8ca8d0785d4e97bdbb.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/banner-images/%20.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/banner-images/ab7c4edd8ab501ed149fc28d301fd349.jpg",
      "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/banner-images/b212405b2b4ff5fc45a3308861375fb1.jpg",

    ]);

    fetchData();

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [imageUrls.length]);

  return (
    <motion.div 
      className="space-y-12 pb-8 bg-gray-100"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <SportBackground>
        <motion.section 
          className="py-24 px-4 md:px-8 rounded-3xl bg-gradient-to-r from-sports-blue to-sports-blue/80 text-white shadow-lg transition-all hover:shadow-xl relative overflow-hidden"
          variants={fadeIn}
        >
          <motion.div 
            className="absolute inset-0"
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          >
            <img 
              src={imageUrls[currentImageIndex]}
              alt="sports action" 
              className="w-full h-full object-cover rounded-3xl shadow-lg"
            />
          </motion.div>

          <motion.div 
            className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10"
            variants={staggerContainer}
          >
            <div className="text-center md:text-left md:max-w-2xl">
              <motion.h1 
                className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight uppercase"
                variants={slideIn}
              >
                Book Your Turf. Rule Your Game.
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed italic"
                variants={fadeIn}
              >
                Access elite sports venues across Delhi — train smart, play hard, and stay ahead.
              </motion.p>
              <motion.div variants={scaleIn}>
                <Link to="/venue">
                  <AnimatedButton 
                    size="lg" 
                    className="rounded-full px-8 py-6 text-lg bg-white text-sports-blue hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    animationVariants={magneticButton}
                  >
                    Book Now
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </AnimatedButton>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>
      </SportBackground>

      {user && (
        <motion.section 
          className="rounded-3xl p-8 bg-gradient-to-r from-sports-lightBlue to-white shadow-lg transition-all hover:shadow-xl"
          variants={fadeIn}
        >
          <SmartRecommendations />
        </motion.section>
      )}

      <motion.section 
        className="rounded-3xl p-8 bg-gradient-to-r from-sports-lightOrange to-white shadow-lg transition-all hover:shadow-xl"
        variants={fadeIn}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h2 
              className="text-3xl font-bold text-sports-orange mb-2"
              variants={slideIn}
            >
              Popular Sports
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              variants={fadeIn}
            >
              Choose your game and own your grind
            </motion.p>
          </div>
          <Link to="/venue">
            <AnimatedButton 
              variant="outline" 
              className="rounded-full border-sports-orange text-sports-orange hover:bg-sports-orange hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              animationVariants={magneticButton}
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </AnimatedButton>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {sports.map((sport) => (
              <motion.div key={sport.id} variants={scaleIn}>
                <SportCard sport={sport} className="transition-all duration-300 hover:scale-105" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      <motion.section 
        className="rounded-3xl p-8 bg-gradient-to-r from-gray-50 to-white shadow-lg transition-all hover:shadow-xl"
        variants={fadeIn}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h2 
              className="text-3xl font-bold mb-2"
              variants={slideIn}
            >
              Featured Venues
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              variants={fadeIn}
            >
              Train where the top players train
            </motion.p>
          </div>
          <Link to="/venue">
            <AnimatedButton 
              variant="outline" 
              className="rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              animationVariants={magneticButton}
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </AnimatedButton>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2l"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {venues.map((venue) => (
              <ScrollReveal key={venue.id}>
                <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <VenueCard 
                    venue={venue} 
                    className="transition-all duration-300"
                  />
                </div>
              </ScrollReveal>
            ))}
          </motion.div>
        )}
      </motion.section>

      <FloatingQuotes />

      <motion.div
        className="fixed top-20 right-10 w-32 h-32 pointer-events-none"
        animate={{
          y: [0, 20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-sports-blue/10 to-sports-orange/10 rounded-full blur-xl" />
      </motion.div>
    </motion.div>
  );
}

