import { useEffect, useState } from "react";
import { Quote, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const QUOTES = [
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "The more I practice, the luckier I get.",
    author: "Gary Player"
  },
  {
    text: "Do not let what you cannot do interfere with what you can do.",
    author: "John Wooden"
  },
  {
    text: "You can't put a limit on anything. The more you dream, the farther you get.",
    author: "Michael Phelps"
  },
  {
    text: "The only way to prove that you’re a good sport is to lose",
    author: "Ernie Banks"
  },
  {
    text:"The more difficult the victory, the greater the happiness in winning.",
    author: "Pelé"
  },
  {
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke"
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
  },
  {
    text: "I hated every minute of training, but I said, 'Don't quit.'",
    author: "Muhammad Ali"
  },
  {
    text: "Winning means you're willing to go longer, work harder.",
    author: "Vince Lombardi"
  }
];

export function FloatingQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        setIsAnimating(false);
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  if (isMobile || !isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed z-50 w-[90%] max-w-md mx-auto left-0 right-0",
        isMobile 
          ? "bottom-4 md:bottom-8" 
          : "bottom-8 left-8"
      )}
    >
      <div 
        className={cn(
          "relative flex items-start gap-3 p-4 pr-12 rounded-2xl shadow-lg",
          "backdrop-blur-xl border border-white/10",
          "transition-all duration-1000 ease-in-out",
          isMobile 
            ? "bg-[#1A1F2C]/70 text-white" 
            : "bg-white/90 dark:bg-gray-800/90",
          isAnimating && "opacity-0 translate-y-2",
          "hover:shadow-xl"
        )}
      >
        <Quote className={cn(
          "w-5 h-5 mt-1 flex-shrink-0", 
          isMobile ? "text-[#9b87f5]" : "text-sports-blue"
        )} />
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            isMobile ? "text-white/90" : "text-gray-800 dark:text-gray-200"
          )}>
            {QUOTES[currentQuoteIndex].text}
          </p>
          <p className={cn(
            "text-xs",
            isMobile ? "text-white/70" : "text-gray-500 dark:text-gray-400"
          )}>
            — {QUOTES[currentQuoteIndex].author}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={cn(
            "absolute top-2 right-2 p-1 rounded-full transition-colors",
            isMobile 
              ? "hover:bg-white/10" 
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          aria-label="Dismiss quote"
        >
          <X className={cn(
            "w-4 h-4", 
            isMobile ? "text-white/70" : "text-gray-400"
          )} />
        </button>
      </div>
    </div>
  );
}
