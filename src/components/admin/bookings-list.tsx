import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/types/booking";
import { toast } from "@/components/ui/sonner";
import { PencilIcon } from "lucide-react";
import { Sport, Venue, BookingStatus, UIBookingStatus } from "@/types/venue";

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [users, setUsers] = useState<{id: string, email: string}[]>([]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("Logged in UID:", user?.id);
        
        if (userError) {
          console.error("Error getting user:", userError);
          return;
        }
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            venue_id,
            sport_id,
            slot_id,
            slot_time,
            status,
            full_name,
            phone,
            created_at,
            updated_at,
            amount
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log("Fetched bookings:", data);
        
        if (data && data.length > 0) {
          const venueIds = [...new Set(data.map(booking => booking.venue_id))];
          const sportIds = [...new Set(data.map(booking => booking.sport_id))];
          const userIds = [...new Set(data.map(booking => booking.user_id))];
          
          const { data: venuesData, error: venuesError } = await supabase
            .from('venues')
            .select('*')
            .in('id', venueIds);
            
          if (venuesError) throw venuesError;
          
          const { data: sportsData, error: sportsError } = await supabase
            .from('sports')
            .select('*')
            .in('id', sportIds);
            
          if (sportsError) throw sportsError;
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds);
            
          if (profilesError) throw profilesError;
          
          const enrichedBookings = data.map(booking => ({
            ...booking,
            venues: venuesData?.find(venue => venue.id === booking.venue_id),
            sports: sportsData?.find(sport => sport.id === booking.sport_id),
            profiles: profilesData?.find(profile => profile.id === booking.user_id)
          }));
          
          setBookings(enrichedBookings);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchVenuesAndSports = async () => {
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*');
      
      if (venueError) {
        console.error("Error fetching venues:", venueError);
        toast.error("Failed to load venues");
        return;
      }
      
      setVenues(venueData || []);
      
      const { data: sportData, error: sportError } = await supabase
        .from('sports')
        .select('*');
      
      if (sportError) {
        console.error("Error fetching sports:", sportError);
        toast.error("Failed to load sports");
        return;
      }
      
      setSports(sportData || []);
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (userError) {
        console.error("Error fetching users:", userError);
        toast.error("Failed to load users");
        return;
      }
      
      setUsers(userData || []);
    };
    
    fetchBookings();
    fetchVenuesAndSports();
  }, []);
  
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm) ||
      booking.venues?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.sports?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditDialogOpen(true);
  };
  
  const handleEditSave = async () => {
    if (!editingBooking) return;
    
    try {
      console.log("Updating booking status:", {
        id: editingBooking.id,
        oldStatus: editingBooking.status,
        newStatus: editingBooking.status
      });
      
      const dbStatus: BookingStatus = editingBooking.status === 'completed' 
        ? 'confirmed' 
        : editingBooking.status as BookingStatus;
      
      const { error } = await supabase
        .from('bookings')
        .update({
          venue_id: editingBooking.venue_id,
          sport_id: editingBooking.sport_id,
          slot_time: editingBooking.slot_time,
          user_id: editingBooking.user_id,
          status: dbStatus
        })
        .eq('id', editingBooking.id);
      
      if (error) throw error;
      
      if (editingBooking.status === 'cancelled') {
        console.log("Booking cancelled, updating slot availability");
        const { error: slotError } = await supabase
          .from('slots')
          .update({ available: true })
          .eq('id', editingBooking.slot_id);
        
        if (slotError) {
          console.error("Error updating slot availability:", slotError);
          toast.error("Failed to update slot availability");
        }
      }
      
      toast.success("Booking updated successfully");
      setIsEditDialogOpen(false);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === editingBooking.id ? editingBooking : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-md w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Venue & Sport</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.full_name}
                </TableCell>
                <TableCell>
                  {booking.profiles?.email || "N/A"}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.venues?.name}</div>
                    <div className="text-sm text-gray-500">{booking.venues?.location}</div>
                    <div className="text-sm text-gray-500">{booking.sports?.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.slot_time), "PPp")}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'cancelled' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>{booking.phone}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditClick(booking)}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          
          {editingBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Customer
                </Label>
                <div className="col-span-3">{editingBooking.full_name}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="venue" className="text-right">
                  Venue
                </Label>
                <Select 
                  value={editingBooking.venue_id} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, venue_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sport" className="text-right">
                  Sport
                </Label>
                <Select 
                  value={editingBooking.sport_id} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, sport_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  User
                </Label>
                <Select 
                  value={editingBooking.user_id} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, user_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editingBooking.status} 
                  onValueChange={(value) => {
                    console.log("Status changed to:", value);
                    setEditingBooking({...editingBooking, status: value as UIBookingStatus});
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
