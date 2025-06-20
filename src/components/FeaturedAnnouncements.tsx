
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import announcementService from "@/services/announcement.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FeaturedAnnouncements = () => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['featured-announcements'],
    queryFn: async () => {
      const response = await announcementService.getFeaturedAnnouncements();
      return response.data;
    },
  });
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mx-auto"></div>
      </div>
    );
  }
  
  if (!announcements || announcements.length === 0) {
    return null;
  }
  
  return (
    <div className="py-12 bg-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">Latest News</h2>
          <p className="text-gray-600">Stay updated with what's happening at L Café</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {announcements.slice(0, 3).map((announcement) => (
            <Card key={announcement._id} className="border-amber-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <CardDescription>
                  {format(new Date(announcement.publishDate), 'MMMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {announcement.summary || announcement.content.substring(0, 100) + '...'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button asChild variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100">
            <Link to="/announcements">
              View All Announcements <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAnnouncements;
