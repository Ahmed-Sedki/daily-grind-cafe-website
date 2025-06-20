
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreateMenuItemData, MenuItem } from "@/services/menu.service";
import menuService from "@/services/menu.service";
import authService from "@/services/auth.service";
import { Loader2 } from "lucide-react";

interface MenuItemFormProps {
  initialData?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuItemForm = ({ initialData, onSuccess, onCancel }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CreateMenuItemData>({
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      category: initialData.category,
      price: initialData.price,
      featured: initialData.featured,
      seasonal: initialData.seasonal,
      dietaryInfo: initialData.dietaryInfo
    } : {
      name: "",
      description: "",
      category: "coffee",
      price: 0,
      featured: false,
      seasonal: false,
      dietaryInfo: {
        vegan: false,
        glutenFree: false,
        vegetarian: false
      }
    }
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const response = await menuService.getCategories();
      return response.data;
    }
  });

  const handleSubmit = async (data: CreateMenuItemData) => {
    try {
      setIsSubmitting(true);
      
      // Get CSRF token
      const csrfToken = await authService.getCsrfToken();
      
      if (initialData) {
        // Update existing menu item
        await menuService.updateMenuItem(initialData._id, data, csrfToken);
        toast({
          title: "Menu item updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Create new menu item
        await menuService.createMenuItem(data, csrfToken);
        toast({
          title: "Menu item created",
          description: `${data.name} has been added to the menu.`
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting menu item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the menu item."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Item name" {...field} />
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
                <Textarea placeholder="Describe your menu item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
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
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesData ? (
                      categoriesData.map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="coffee">Coffee</SelectItem>
                        <SelectItem value="tea">Tea</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dietaryInfo.vegan"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Vegan</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dietaryInfo.glutenFree"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Gluten Free</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dietaryInfo.vegetarian"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Vegetarian</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Item</FormLabel>
                  <FormDescription>
                    Show on homepage featured section
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="seasonal"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Seasonal Item</FormLabel>
                  <FormDescription>
                    Seasonal or limited-time offer
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update' : 'Create'} Menu Item
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MenuItemForm;
