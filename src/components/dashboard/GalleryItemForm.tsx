import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GalleryItem } from "@/services/gallery.service";
import galleryService from "@/services/gallery.service";
import authService from "@/services/auth.service";
import api from "@/services/api";

// Define form schema
const galleryItemSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Please select a category" }),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

type GalleryFormValues = z.infer<typeof galleryItemSchema>;

interface GalleryItemFormProps {
  galleryItem?: GalleryItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const GalleryItemForm = ({
  galleryItem,
  onSuccess,
  onCancel,
}: GalleryItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const isEditing = !!galleryItem;

  // Initialize the form
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: {
      title: galleryItem?.title || "",
      description: galleryItem?.description || "",
      category: galleryItem?.category || "",
      featured: galleryItem?.featured || false,
      sortOrder: galleryItem?.sortOrder || 0,
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await galleryService.getGalleryCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load gallery categories.",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Get complete URL for images
  const getImageUrl = (path: string) => {
    if (!path) return '';
    
    // If the path already includes the full URL, return it as is
    if (path.startsWith('http')) return path;
    
    // Otherwise, prepend the API base URL
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

  // Set preview image if editing
  useEffect(() => {
    if (galleryItem && (galleryItem.thumbnail || galleryItem.imagePath)) {
      setPreviewUrl(getImageUrl(galleryItem.thumbnail || galleryItem.imagePath));
    }
  }, [galleryItem]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission
  const onSubmit = async (data: GalleryFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get CSRF token
      const csrfToken = await authService.getCsrfToken();
      
      // Create form data
      const formData = new FormData();
      formData.append("title", data.title);
      
      if (data.description) {
        formData.append("description", data.description);
      }
      
      formData.append("category", data.category);
      formData.append("featured", data.featured.toString());
      formData.append("sortOrder", data.sortOrder.toString());
      
      if (file) {
        formData.append("image", file);
      }
      
      if (isEditing) {
        // Update existing gallery item
        await galleryService.updateGalleryItem(galleryItem._id, formData, csrfToken);
        toast({
          title: "Gallery item updated",
          description: "The gallery item has been updated successfully.",
        });
      } else {
        // Create new gallery item
        await galleryService.createGalleryItem(formData, csrfToken);
        toast({
          title: "Gallery item created",
          description: "The new gallery item has been added successfully.",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the gallery item.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter description (optional)" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Display this item in featured sections
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <FormLabel>Image</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                <Input
                  type="file"
                  id="image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="image" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {isEditing ? "Replace image" : "Upload image"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Click to browse or drag and drop
                    </p>
                  </div>
                </label>
              </div>
              {!isEditing && !file && (
                <p className="text-sm text-destructive mt-2">
                  {isSubmitting ? "" : "Image is required for new gallery items"}
                </p>
              )}
            </div>
            
            {previewUrl && (
              <div className="aspect-square relative rounded-md overflow-hidden border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!isEditing && !file)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update Gallery Item" : "Create Gallery Item"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GalleryItemForm;
