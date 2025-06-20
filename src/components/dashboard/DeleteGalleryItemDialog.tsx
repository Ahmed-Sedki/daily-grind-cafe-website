
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import galleryService from "@/services/gallery.service";
import authService from "@/services/auth.service";

interface DeleteGalleryItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItemId: string;
  galleryItemTitle: string;
  onSuccess: () => void;
}

const DeleteGalleryItemDialog = ({
  isOpen,
  onClose,
  galleryItemId,
  galleryItemTitle,
  onSuccess,
}: DeleteGalleryItemDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Get CSRF token
      const csrfToken = await authService.getCsrfToken();
      
      // Delete the gallery item
      await galleryService.deleteGalleryItem(galleryItemId, csrfToken);
      
      toast({
        title: "Gallery item deleted",
        description: `${galleryItemTitle} has been removed from the gallery.`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the gallery item.",
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <span className="font-medium">{galleryItemTitle}</span> from your gallery. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGalleryItemDialog;
