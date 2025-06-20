import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import announcementService, { Announcement } from "@/services/announcement.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AnnouncementDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: announcement, isLoading, error } = useQuery({
    queryKey: ['announcement', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      const response = await announcementService.getAnnouncementBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Announcement Not Found</h1>
            <p className="text-gray-600 mb-6">The announcement you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/announcements')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Announcements
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/announcements')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Announcements
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
          ) : announcement ? (
            <Card className="border-amber-100">
              {/* Header Image */}
              {announcement.image && (
                <div className="h-64 md:h-80 overflow-hidden rounded-t-lg">
                  <img 
                    src={announcement.image} 
                    alt={announcement.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="pb-4">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(announcement.category)}>
                    <Tag className="h-3 w-3 mr-1" />
                    {formatCategoryName(announcement.category)}
                  </Badge>
                  {announcement.featured && (
                    <Badge className="bg-amber-100 text-amber-800">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {announcement.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(announcement.publishDate), 'MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    By {announcement.author.firstName} {announcement.author.lastName}
                  </div>
                </div>

                {/* Summary */}
                {announcement.summary && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-lg text-gray-700 font-medium">
                      {announcement.summary}
                    </div>
                  </>
                )}
              </CardHeader>

              <CardContent>
                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: announcement.content.replace(/\n/g, '<br />') }}
                  />
                </div>

                {/* Expiry Date */}
                {announcement.expiryDate && (
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> This announcement expires on {format(new Date(announcement.expiryDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Related Actions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Want to stay updated with our latest news?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/announcements">View All Announcements</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnnouncementDetail;
