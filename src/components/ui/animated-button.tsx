
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";
import { Variants } from "framer-motion";

interface AnimatedButtonProps extends ButtonProps {
  animationVariants?: Variants;
  initialState?: string;
  animateState?: string;
  whileHoverState?: string;
  whileTapState?: string;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    className, 
    animationVariants, 
    initialState = "rest", 
    animateState = "rest",
    whileHoverState = "hover",
    whileTapState = "tap",
    ...props 
  }, ref) => {
    return (
      <motion.div
        initial={initialState}
        animate={animateState}
        whileHover={whileHoverState}
        whileTap={whileTapState}
        variants={animationVariants}
      >
        <Button
          ref={ref}
          className={className}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
