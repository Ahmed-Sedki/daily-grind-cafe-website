
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import galleryService, { GalleryItem } from "@/services/gallery.service";
import categoryService, { Category } from "@/services/category.service";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: async () => {
      const response = await categoryService.getCategoriesByType('gallery');
      return response.data;
    },
  });
  
  const { data: galleryItems, isLoading: isGalleryLoading } = useQuery({
    queryKey: ['gallery-items', activeCategory],
    queryFn: async () => {
      if (activeCategory === "all") {
        const response = await galleryService.getGalleryItems(1, 50);
        return response.data.galleryItems;
      } else if (activeCategory === "featured") {
        const response = await galleryService.getFeaturedGalleryItems();
        return response.data;
      } else {
        const response = await galleryService.getGalleryItemsByCategory(activeCategory, 1, 50);
        return response.data.galleryItems;
      }
    },
  });
  
  const openImageDialog = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    
    if (path.startsWith('http')) return path;
    
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-800 mb-6 text-center">Our Gallery</h1>
          <p className="text-lg text-center max-w-3xl mx-auto mb-10">
            Explore beautiful moments from L Café. From our aromatic coffee creations to 
            our cozy atmosphere and special events.
          </p>
          
          {isCategoriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
          ) : (
            <Tabs 
              defaultValue="all" 
              className="w-full"
              onValueChange={setActiveCategory}
            >
              <div className="flex justify-center mb-8 overflow-x-auto pb-2">
                <TabsList className="grid grid-flow-col auto-cols-max gap-1">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  {categories?.map((category: Category) => (
                    <TabsTrigger key={category.slug} value={category.slug}>
                      <div className="flex items-center gap-2">
                        {category.icon && <span>{category.icon}</span>}
                        {category.name}
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value={activeCategory} className="mt-6">
                {isGalleryLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems?.map((item: GalleryItem) => (
                      <div 
                        key={item._id} 
                        className="cursor-pointer group overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300"
                        onClick={() => openImageDialog(item)}
                      >
                        <AspectRatio ratio={1 / 1} className="bg-gray-100">
                          <img 
                            src={getImageUrl(item.thumbnail || item.imagePath)}
                            alt={item.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </AspectRatio>
                        <div className="p-3">
                          <h3 className="font-medium text-amber-800 truncate">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!galleryItems || galleryItems.length === 0) && (
                      <p className="text-gray-500 italic col-span-full text-center py-10">
                        No images available in this category.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-800">{selectedImage?.title}</DialogTitle>
            {selectedImage?.description && (
              <DialogDescription>{selectedImage.description}</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="mt-2">
            <div className="max-h-[60vh] overflow-hidden rounded-md">
              <img 
                src={selectedImage ? getImageUrl(selectedImage.imagePath) : ''} 
                alt={selectedImage?.title} 
                className="w-full h-auto object-contain max-h-[60vh]"
                loading="lazy"
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Category: {selectedImage?.category}</p>
              {selectedImage?.uploadedBy && (
                <p>By: {selectedImage.uploadedBy.firstName} {selectedImage.uploadedBy.lastName}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Gallery;
