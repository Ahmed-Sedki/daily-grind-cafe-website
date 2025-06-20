
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import galleryService, { GalleryItem } from "@/services/gallery.service";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  SortDesc
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import GalleryItemForm from "./GalleryItemForm";
import DeleteGalleryItemDialog from "./DeleteGalleryItemDialog";

const DashboardGallery = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['gallery-items', currentPage],
    queryFn: async () => {
      const response = await galleryService.getGalleryItems(currentPage, 12);
      return response.data;
    },
  });

  // Get complete URL for images
  const getImageUrl = (path: string) => {
    if (!path) return '';
    
    // If the path already includes the full URL, return it as is
    if (path.startsWith('http')) return path;
    
    // Otherwise, prepend the API base URL
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditItem(null);
    refetch();
  };

  const handleDeleteSuccess = () => {
    setDeleteItem(null);
    refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gallery Management</h1>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Image
        </Button>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-amber-800">
          Upload and manage images for your café's gallery. All images will be automatically 
          resized and optimized. You can categorize images and mark them as featured.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.galleryItems?.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={getImageUrl(item.thumbnail || item.imagePath)}
                  alt={item.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.featured && (
                    <Badge variant="default" className="bg-amber-500">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-amber-800 truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.sortOrder !== undefined && item.sortOrder > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <SortDesc className="h-3 w-3 mr-1" />
                      {item.sortOrder}
                    </div>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                )}
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditItem(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={() => setDeleteItem(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {(!data?.galleryItems || data.galleryItems.length === 0) && (
            <div className="col-span-full py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <Image className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No images found</h3>
                <p className="text-gray-500 mb-4">Add your first gallery image to get started.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Image
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {data?.totalPages > 1 && (
        <div className="py-4 mt-6 border-t flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">
              Showing page {data.currentPage} of {data.totalPages}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
              disabled={currentPage === data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Add New Gallery Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Add New Gallery Item</DialogTitle>
          <GalleryItemForm 
            onSuccess={handleAddSuccess} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Gallery Item Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Edit Gallery Item</DialogTitle>
          {editItem && (
            <GalleryItemForm 
              galleryItem={editItem}
              onSuccess={handleEditSuccess} 
              onCancel={() => setEditItem(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      {deleteItem && (
        <DeleteGalleryItemDialog
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          galleryItemId={deleteItem._id}
          galleryItemTitle={deleteItem.title}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default DashboardGallery;
