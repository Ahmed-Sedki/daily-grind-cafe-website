
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import announcementService, { Announcement } from "@/services/announcement.service";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const DashboardAnnouncements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create form setup
  const createForm = useForm({
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      category: "general",
      featured: false
    }
  });
  
  // Edit form setup
  const editForm = useForm({
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      category: "general",
      featured: false,
      publishDate: "",
      expiryDate: ""
    }
  });

  // Fetch announcements
  const { data, isLoading } = useQuery({
    queryKey: ['announcements', currentPage],
    queryFn: async () => {
      const response = await announcementService.getAnnouncements(currentPage, 10);
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await announcementService.createAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Create error details:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...formData } = data;
      console.log("Updating announcement ID:", id);
      console.log("With data:", formData);
      return await announcementService.updateAnnouncement(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Update error details:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await announcementService.deleteAnnouncement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Delete error details:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const handleCreateSubmit = (formData: any) => {
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (formData: any) => {
    if (selectedAnnouncementId) {
      updateMutation.mutate({ 
        id: selectedAnnouncementId, 
        ...formData 
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedAnnouncementId) {
      deleteMutation.mutate(selectedAnnouncementId);
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncementId(announcement._id);
    editForm.reset({
      title: announcement.title,
      content: announcement.content,
      summary: announcement.summary || "",
      category: announcement.category,
      featured: announcement.featured,
      publishDate: announcement.publishDate,
      expiryDate: announcement.expiryDate,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (id: string) => {
    setSelectedAnnouncementId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Announcements Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create Announcement
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader className="bg-gray-50 border-b">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {data?.announcements?.map((announcement: Announcement) => (
                <TableRow key={announcement._id} className="hover:bg-gray-50">
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>{announcement.category}</TableCell>
                  <TableCell>
                    {format(new Date(announcement.publishDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {announcement.featured ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Yes</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(announcement)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => openDeleteDialog(announcement._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {(!data?.announcements || data.announcements.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No announcements found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {data?.totalPages > 1 && (
            <div className="py-4 px-4 border-t flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">
                  Showing page {data.currentPage} of {data.totalPages}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                  disabled={currentPage === data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
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
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="menu">Menu</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Featured announcement
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    createForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
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
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="menu">Menu</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Featured announcement
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardAnnouncements;
