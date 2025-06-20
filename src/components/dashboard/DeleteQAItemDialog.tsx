
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
import qaService from "@/services/qa.service";

interface DeleteQAItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qaItemId: string;
  qaItemQuestion: string;
  onSuccess: () => void;
}

const DeleteQAItemDialog = ({
  isOpen,
  onClose,
  qaItemId,
  qaItemQuestion,
  onSuccess,
}: DeleteQAItemDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Delete the FAQ item using the updated service method
      await qaService.deleteQAItem(qaItemId);
      
      toast({
        title: "FAQ item deleted",
        description: "The question has been removed from the FAQ.",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error deleting FAQ item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the FAQ item.",
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
            This will remove the question "{qaItemQuestion}" from your FAQ. 
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

export default DeleteQAItemDialog;
