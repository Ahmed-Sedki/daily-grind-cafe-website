
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
import menuService from "@/services/menu.service";
import authService from "@/services/auth.service";

interface DeleteMenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  menuItemName: string;
  onSuccess: () => void;
}

const DeleteMenuItemDialog = ({
  isOpen,
  onClose,
  menuItemId,
  menuItemName,
  onSuccess,
}: DeleteMenuItemDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Get CSRF token
      const csrfToken = await authService.getCsrfToken();
      
      // Delete the menu item
      await menuService.deleteMenuItem(menuItemId, csrfToken);
      
      toast({
        title: "Menu item deleted",
        description: `${menuItemName} has been removed from the menu.`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the menu item.",
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
            This will remove <span className="font-medium">{menuItemName}</span> from your menu. 
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

export default DeleteMenuItemDialog;
