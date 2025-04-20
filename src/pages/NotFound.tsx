
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@/utils/iconMapping";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NotFound() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className={`${isMobile ? 'text-6xl' : 'text-7xl'} font-bold text-sports-blue mb-4`}>404</h1>
      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-4`}>Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button className="rounded-full bg-sports-blue hover:bg-sports-blue/90">
          <HomeIcon className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
