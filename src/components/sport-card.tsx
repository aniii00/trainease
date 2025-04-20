
import { Link } from "react-router-dom";
import { getSportIcon } from "@/utils/iconMapping";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sport } from "@/types/venue";
import { motion } from "framer-motion";

interface SportCardProps {
  sport: Sport;
  className?: string;
}

export function SportCard({ sport, className }: SportCardProps) {
  return (
    <Link to={`/venue?sportId=${sport.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={cn("h-full transition-all hover:shadow-lg rounded-2xl", className)}>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
              className="mb-4 p-4 rounded-full bg-gradient-to-r from-sports-lightBlue to-sports-lightBlue/70 text-sports-blue shadow-md"
              whileHover={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5 }}
            >
              {getSportIcon("ball")}
            </motion.div>
            <motion.h3 
              className="font-semibold text-lg mb-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {sport.name}
            </motion.h3>
            <motion.p 
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {sport.description || `Book ${sport.name} sessions at our venues`}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
