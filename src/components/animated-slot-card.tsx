
import { motion } from "framer-motion";
import { SlotCard } from "./slot-card";
import { Slot } from "@/types/venue";
import { cn } from "@/lib/utils";

interface AnimatedSlotCardProps {
  slot: Slot;
  index: number;
  className?: string;
}

export function AnimatedSlotCard({ slot, index, className }: AnimatedSlotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          duration: 0.5, 
          delay: index * 0.1,
          type: "spring",
          stiffness: 300
        }
      }}
      whileHover={{ 
        scale: 1.03, 
        transition: { duration: 0.2 } 
      }}
      className={cn("relative group", className)}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#9b87f5]/30 to-[#FF7A00]/30 opacity-0 group-hover:opacity-100 blur-sm transition-all"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.3 }}
      />
      <SlotCard 
        slot={slot} 
        className="relative z-10 backdrop-blur-lg bg-white/70 hover:bg-white/80 transition-all" 
      />
    </motion.div>
  );
}
