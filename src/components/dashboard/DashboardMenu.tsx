
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import menuService, { MenuItem } from "@/services/menu.service";
import MenuItemForm from "./MenuItemForm";
import DeleteMenuItemDialog from "./DeleteMenuItemDialog";

const DashboardMenu = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['menu-items', currentPage],
    queryFn: async () => {
      const response = await menuService.getAllItems(currentPage, 10);
      return response.data;
    },
  });

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedMenuItem(null);
    queryClient.invalidateQueries({ queryKey: ['menu-items'] });
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedMenuItem(null);
    queryClient.invalidateQueries({ queryKey: ['menu-items'] });
  };

  const openEditDialog = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setIsDeleteDialogOpen(true);
  };

  if (isError && error instanceof Error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to load menu items: ${error.message}`
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Seasonal</TableHead>
                  <TableHead>Dietary Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.menuItems?.map((item: MenuItem) => (
                  <TableRow key={item._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.featured ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.seasonal ? (
                        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {item.dietaryInfo.vegan && (
                          <Badge variant="outline" className="border-green-500 text-green-700">V</Badge>
                        )}
                        {item.dietaryInfo.vegetarian && (
                          <Badge variant="outline" className="border-green-500 text-green-700">VG</Badge>
                        )}
                        {item.dietaryInfo.glutenFree && (
                          <Badge variant="outline" className="border-amber-500 text-amber-700">GF</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDeleteDialog(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!data?.menuItems || data.menuItems.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                      No menu items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
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
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                  disabled={currentPage === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setIsCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {selectedMenuItem && (
            <MenuItemForm 
              initialData={selectedMenuItem}
              onSuccess={handleEditSuccess} 
              onCancel={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      {selectedMenuItem && (
        <DeleteMenuItemDialog 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          menuItemId={selectedMenuItem._id}
          menuItemName={selectedMenuItem.name}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default DashboardMenu;
