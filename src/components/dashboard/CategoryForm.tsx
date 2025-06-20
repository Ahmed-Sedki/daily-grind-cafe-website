import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import categoryService, { Category, CreateCategoryData } from "@/services/category.service";

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CategoryForm = ({ initialData, onSuccess, onCancel }: CategoryFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CreateCategoryData>({
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      description: initialData.description || "",
      color: initialData.color,
      icon: initialData.icon || "",
      sortOrder: initialData.sortOrder,
      isDefault: initialData.isDefault
    } : {
      name: "",
      type: "menu",
      description: "",
      color: "#6B7280",
      icon: "",
      sortOrder: 0,
      isDefault: false
    }
  });

  const onSubmit = async (data: CreateCategoryData) => {
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        await categoryService.updateCategory(initialData._id, data);
      } else {
        await categoryService.createCategory(data);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Category form error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} category`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    { name: 'Gray', value: '#6B7280' },
    { name: 'Brown', value: '#8B4513' },
    { name: 'Green', value: '#228B22' },
    { name: 'Blue', value: '#4682B4' },
    { name: 'Purple', value: '#9370DB' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Red', value: '#FF6347' },
    { name: 'Pink', value: '#FFB6C1' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Teal', value: '#20B2AA' }
  ];

  const commonIcons = [
    '☕', '🍵', '🍽️', '🧁', '🍂', // Menu
    '🏠', '📸', '🥤', '🎉', '👥', // Gallery
    '❓', '🛍️', '📅', '🥗', '💡', // Q&A
    '📢', '🏷️', '📋', '🎊', '📰'  // Announcements
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!!initialData} // Don't allow changing type when editing
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="menu">Menu</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                  <SelectItem value="qa">Q&A</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Brief description of this category"
                  className="resize-none"
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input {...field} placeholder="#6B7280" />
                    <div className="grid grid-cols-5 gap-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                          style={{ backgroundColor: color.value }}
                          onClick={() => field.onChange(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input {...field} placeholder="🏷️" />
                    <div className="grid grid-cols-5 gap-1">
                      {commonIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className="w-8 h-8 rounded border border-gray-300 hover:border-gray-500 flex items-center justify-center text-lg"
                          onClick={() => field.onChange(icon)}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Default Category</FormLabel>
                <FormDescription>
                  This will be the default selection for new items
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
