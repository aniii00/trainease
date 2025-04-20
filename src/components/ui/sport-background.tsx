
import { cn } from "@/lib/utils";

interface SportBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export function SportBackground({ className, children }: SportBackgroundProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-sports-pattern before:opacity-5 before:z-0",
      className
    )}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
