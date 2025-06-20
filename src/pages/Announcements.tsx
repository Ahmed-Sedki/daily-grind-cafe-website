
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import announcementService, { Announcement } from "@/services/announcement.service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Announcements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ['public-announcements', currentPage],
    queryFn: async () => {
      const response = await announcementService.getAnnouncements(currentPage, 6);
      return response.data;
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'menu':
      case 'menu-updates':
        return 'bg-green-100 text-green-800';
      case 'promotion':
        return 'bg-purple-100 text-purple-800';
      case 'general':
      case 'general-announcement':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCategoryName = (categorySlug: string) => {
    // Convert slug back to readable name
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">
            Café Announcements
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news, events, and promotions from L Café.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data?.announcements?.map((announcement: Announcement) => (
                <Card
                  key={announcement._id}
                  className="overflow-hidden hover:shadow-md transition-shadow border-amber-100 cursor-pointer"
                  onClick={() => navigate(`/announcements/${announcement.slug}`)}
                >
                  {announcement.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={announcement.image} 
                        alt={announcement.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={`${getCategoryColor(announcement.category)}`}>
                        {formatCategoryName(announcement.category)}
                      </Badge>
                      {announcement.featured && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mt-2">{announcement.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(announcement.publishDate), 'MMMM dd, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {announcement.summary || announcement.content.substring(0, 100) + '...'}
                    </p>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    By {announcement.author.firstName} {announcement.author.lastName}
                  </CardFooter>
                </Card>
              ))}
              
              {(!data?.announcements || data.announcements.length === 0) && (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  No announcements available at this time.
                </div>
              )}
            </div>
            
            {data?.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-amber-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-amber-800">
                  Page {currentPage} of {data.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                  disabled={currentPage === data.totalPages}
                  className="px-4 py-2 border border-amber-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Announcements;
