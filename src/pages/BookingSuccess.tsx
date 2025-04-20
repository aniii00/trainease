
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckIcon, HomeIcon, UserIcon } from "@/utils/iconMapping";

export default function BookingSuccess() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckIcon className="h-16 w-16 text-green-600" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-8">
        Your booking has been successfully confirmed. A confirmation message has been sent to your phone number.
      </p>
      
      <div className="flex flex-col gap-4">
        <Link to="/profile">
          <Button className="w-full" variant="default">
            <UserIcon className="mr-2 h-4 w-4" />
            View My Bookings
          </Button>
        </Link>
        
        <Link to="/">
          <Button variant="outline" className="w-full">
            <HomeIcon className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
        
        <Link to="/venue">
          <Button variant="outline" className="w-full">
            Book Another Slot
          </Button>
        </Link>
      </div>
    </div>
  );
}
