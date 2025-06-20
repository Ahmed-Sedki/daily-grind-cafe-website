import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Coffee, ExternalLink, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SitemapItem {
  _id: string;
  url: string;
  title: string;
  level: number;
  children: SitemapItem[];
}

const Sitemap = () => {
  const [sitemapData, setSitemapData] = useState<SitemapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('/api/sitemap/hierarchy');
        if (!response.ok) {
          throw new Error('Failed to fetch sitemap');
        }
        const data = await response.json();
        setSitemapData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  const renderSitemapItem = (item: SitemapItem, depth = 0) => {
    const paddingLeft = depth * 2; // 2rem per level
    
    return (
      <div key={item._id} className="mb-2">
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-cafe-cream/50 transition-colors`}
          style={{ paddingLeft: `${paddingLeft + 1}rem` }}
        >
          <MapPin size={16} className="text-cafe-brown flex-shrink-0" />
          <Link 
            to={item.url} 
            className="text-cafe-darkBrown hover:text-cafe-orange transition-colors font-medium flex items-center gap-2 group"
          >
            {item.title}
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="ml-4">
            {item.children.map(child => renderSitemapItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-cream to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Coffee size={32} className="text-cafe-brown" />
              <h1 className="section-title mb-0">Site Map</h1>
            </div>
            <p className="text-lg text-cafe-brown max-w-2xl mx-auto">
              Navigate through all the pages and sections of Daily Grind Cafe. 
              Find exactly what you're looking for with our comprehensive site structure.
            </p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-cafe-brown">
                  <Coffee className="animate-spin" size={24} />
                  <span className="text-lg">Loading sitemap...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-medium">Error loading sitemap</p>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="bg-white rounded-xl shadow-lg border border-cafe-cream/50 overflow-hidden">
                <div className="bg-cafe-darkBrown text-cafe-cream p-6">
                  <h2 className="text-xl font-serif font-bold flex items-center gap-3">
                    <MapPin size={24} />
                    Website Structure
                  </h2>
                  <p className="text-cafe-cream/80 mt-2">
                    All pages and sections organized for easy navigation
                  </p>
                </div>
                
                <div className="p-6">
                  {sitemapData.length > 0 ? (
                    <div className="space-y-1">
                      {sitemapData.map(item => renderSitemapItem(item))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-cafe-brown">
                      <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No sitemap data available</p>
                      <p className="text-sm opacity-75">Please try again later</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md border border-cafe-cream/50">
                <h3 className="font-serif font-bold text-lg text-cafe-darkBrown mb-3">
                  Need Help?
                </h3>
                <p className="text-cafe-brown mb-4">
                  Can't find what you're looking for? Our contact page has all the ways to reach us.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 text-cafe-orange hover:text-cafe-darkBrown transition-colors font-medium"
                >
                  Contact Us <ExternalLink size={16} />
                </Link>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md border border-cafe-cream/50">
                <h3 className="font-serif font-bold text-lg text-cafe-darkBrown mb-3">
                  XML Sitemap
                </h3>
                <p className="text-cafe-brown mb-4">
                  For search engines and technical purposes, you can access our XML sitemap.
                </p>
                <a 
                  href="/sitemap.xml" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cafe-orange hover:text-cafe-darkBrown transition-colors font-medium"
                >
                  View XML Sitemap <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sitemap;
