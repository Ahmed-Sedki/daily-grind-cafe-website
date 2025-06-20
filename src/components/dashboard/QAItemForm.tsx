
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import qaService, { QAItem } from "@/services/qa.service";

// Form validation schema
const qaItemSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  sortOrder: z.coerce.number().int().nonnegative(),
});

type QAItemFormValues = z.infer<typeof qaItemSchema>;

interface QAItemFormProps {
  qaItem?: QAItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const QAItemForm = ({ qaItem, onSuccess, onCancel }: QAItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!qaItem;

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["qa-categories"],
    queryFn: async () => {
      const response = await qaService.getQACategories();
      return response.data;
    },
  });

  // Initialize form with default values or existing item values
  const form = useForm<QAItemFormValues>({
    resolver: zodResolver(qaItemSchema),
    defaultValues: {
      question: qaItem?.question || "",
      answer: qaItem?.answer || "",
      category: qaItem?.category || "general",
      sortOrder: qaItem?.sortOrder || 0,
    },
  });

  // Handle form submission
  const onSubmit = async (values: QAItemFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && qaItem) {
        // Update existing item
        await qaService.updateQAItem(qaItem._id, values);
        toast({
          title: "FAQ item updated",
          description: "The question has been updated successfully.",
        });
      } else {
        // Create new item
        await qaService.createQAItem(values);
        toast({
          title: "FAQ item created",
          description: "New question has been added to the FAQ.",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting FAQ item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} the FAQ item.`,
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
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter question here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter detailed answer here..." 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {categories?.map((category: string) => (
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
          
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update FAQ Item" : "Create FAQ Item"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QAItemForm;
