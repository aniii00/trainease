
import { BackIcon } from "@/utils/iconMapping";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backTo = "/",
  action,
  className
}: PageHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(`flex items-center justify-between ${isMobile ? 'py-3 mb-3' : 'py-4 mb-4'} border-b`, className)}>
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Link to={backTo} className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-full hover:bg-gray-100`}>
            <BackIcon className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'} text-gray-700`} />
          </Link>
        )}
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
