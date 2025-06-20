import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import categoryService, { Category } from "@/services/category.service";

interface DeleteCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteCategoryDialog = ({ category, isOpen, onClose, onSuccess }: DeleteCategoryDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(category._id);
      onSuccess();
    } catch (error: any) {
      console.error('Delete category error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!category) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'menu':
        return 'bg-blue-100 text-blue-800';
      case 'gallery':
        return 'bg-green-100 text-green-800';
      case 'qa':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Category
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The category will be deactivated and hidden from users.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              {category.icon && <span className="text-lg">{category.icon}</span>}
              <span className="font-medium">{category.name}</span>
              <Badge className={getTypeColor(category.type)}>
                {category.type}
              </Badge>
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}

            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-gray-600">Color: {category.color}</span>
            </div>

            {category.isDefault && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-sm text-yellow-800">
                  ⚠️ This is a default category and cannot be deleted.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting || category.isDefault}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
