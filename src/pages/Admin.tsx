import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookingsList } from "@/components/admin/bookings-list";
import { VenuesTab } from "@/components/admin/venues-tab";
import { SportsTab } from "@/components/admin/sports-tab";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { AlertTriangle } from "lucide-react";
import { ShieldIcon } from "@/utils/iconMapping";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("bookings");
  const { user, profile, isAdmin, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("Admin page - Auth state:", { 
      user: !!user, 
      profile: profile,
      isAdmin: isAdmin,
      profileRole: profile?.role,
      userEmail: user?.email
    });
  }, [user, profile, isAdmin]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Checking permissions...</span>
      </div>
    );
  }
  
  if (!user) {
    toast.error("You must be logged in to access the admin panel");
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">
            You do not have permission to access the admin panel. This area is restricted to admin users only.
          </p>
          <p className="text-gray-600 text-sm">
            Current role: {profile?.role || "Unknown"}
          </p>
          <p className="text-gray-600 text-sm">
            Current email: {user?.email || "Unknown"}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Admin Panel"
        subtitle="Manage bookings, venues, and sports"
        action={
          <div className="flex items-center text-primary">
            <ShieldIcon className="mr-2 h-6 w-6" />
          </div>
        }
      />
      
      <Card className="bg-green-50 border-green-200 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center text-green-700">
            <ShieldIcon className="h-5 w-5 mr-2" />
            <p>You are logged in as an admin with full access to the admin panel.</p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="bookings" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-6">
          <BookingsList />
        </TabsContent>
        
        <TabsContent value="venues" className="mt-6">
          <VenuesTab />
        </TabsContent>
        
        <TabsContent value="sports" className="mt-6">
          <SportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
