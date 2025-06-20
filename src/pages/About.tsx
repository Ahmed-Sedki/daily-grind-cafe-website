
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import announcementService from "@/services/announcement.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About = () => {
  const navigate = useNavigate();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', 'featured'],
    queryFn: async () => {
      const response = await announcementService.getFeaturedAnnouncements();
      return response.data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-800 mb-6">About L Café</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg mb-4">
              Welcome to L Café, where every cup tells a story and every bite creates a memory. 
              Established in 2015, our café has become a beloved community hub where people gather 
              to enjoy exceptional coffee, delicious food, and warm conversation.
            </p>
            
            <p className="text-lg mb-4">
              Our mission is simple: to create an inviting space that feels like home, serve 
              coffee that inspires, and foster connections that matter. We source our beans 
              ethically from sustainable farms around the world, and our food is made fresh 
              daily using locally-sourced ingredients whenever possible.
            </p>
            
            <h2 className="text-2xl font-semibold text-amber-700 mt-8 mb-4">Our Story</h2>
            
            <p className="text-lg mb-4">
              L Café began as a dream shared by two friends who believed that a great café 
              could be more than just a place to grab coffee – it could be a cornerstone of 
              community life. Starting with just four tables and a passionate commitment to 
              quality, we've grown into the warm, vibrant space you see today.
            </p>
            
            <h2 className="text-2xl font-semibold text-amber-700 mt-8 mb-4">Our Values</h2>
            
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li><strong>Quality:</strong> We never compromise on the quality of our coffee, food, or service.</li>
              <li><strong>Community:</strong> We strive to create a welcoming space for everyone and to give back to our local community.</li>
              <li><strong>Sustainability:</strong> We make environmentally conscious choices in our sourcing, operations, and waste management.</li>
              <li><strong>Innovation:</strong> We continuously explore new flavors, techniques, and ideas to keep our menu fresh and exciting.</li>
            </ul>
          </div>
          
          <Separator className="my-8" />
          
          <h2 className="text-2xl font-semibold text-amber-700 mb-6">Latest News</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements?.map((announcement) => (
                <Card
                  key={announcement._id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/announcements/${announcement.slug}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-amber-800">{announcement.title}</CardTitle>
                    <CardDescription>
                      {new Date(announcement.publishDate).toLocaleDateString()} • {announcement.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{announcement.summary || announcement.content.substring(0, 150) + '...'}</p>
                  </CardContent>
                </Card>
              ))}
              
              {(!announcements || announcements.length === 0) && (
                <p className="text-gray-500 italic">No announcements available at the moment.</p>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
