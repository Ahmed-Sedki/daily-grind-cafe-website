
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNewAuth } from "@/contexts/NewAuthContext";
import { useToast } from "@/components/ui/use-toast";
import userService, { User, CreateUserData, UpdateUserData } from "@/services/user.service";
import {
  User as UserIcon,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  CheckCircle,
  XCircle
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";

const DashboardUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "staff",
  });
  const [updateFormData, setUpdateFormData] = useState<UpdateUserData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "staff",
    active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useNewAuth();

  // Fetch users data with error handling
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', currentPage],
    queryFn: async () => {
      try {
        const response = await userService.getUsers(currentPage, 10);
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Error loading users",
          description: "There was a problem fetching the user list."
        });
        throw error;
      }
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      return userService.createUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateDialogOpen(false);
      resetCreateForm();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      return userService.updateUser(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      resetUpdateForm();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update user error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return userService.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      return userService.changeUserPassword(id, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const resetCreateForm = () => {
    setCreateFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "staff",
    });
  };

  const resetUpdateForm = () => {
    setUpdateFormData({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "staff",
      active: true,
    });
    setSelectedUserId(null);
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string, formType: 'create' | 'update') => {
    if (formType === 'create') {
      setCreateFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setUpdateFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setUpdateFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createFormData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      updateMutation.mutate({ id: selectedUserId, data: updateFormData });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUserId) {
      deleteMutation.mutate(selectedUserId);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && newPassword) {
      changePasswordMutation.mutate({ id: selectedUserId, password: newPassword });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUserId(user._id);
    setUpdateFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      active: user.active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const openPasswordDialog = (id: string) => {
    setSelectedUserId(id);
    setNewPassword("");
    setIsPasswordDialogOpen(true);
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">Failed to load user data. Please try again.</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader className="bg-gray-50 border-b">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {data?.users?.map((user: User) => (
              <TableRow key={user._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <UserIcon className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'editor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {user.active ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" /> Active
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="mr-1 h-4 w-4" /> Inactive
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                      disabled={user._id === localStorage.getItem('userId')}
                      title={user._id === localStorage.getItem('userId') ? "Cannot edit yourself" : "Edit user"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPasswordDialog(user._id)}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(user._id)}
                      disabled={user._id === localStorage.getItem('userId')}
                      title={user._id === localStorage.getItem('userId') ? "Cannot delete yourself" : "Delete user"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {(!data?.users || data.users.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No users found
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

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={createFormData.firstName}
                    onChange={handleCreateInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={createFormData.lastName}
                    onChange={handleCreateInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={createFormData.username}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={createFormData.email}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={createFormData.password}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={createFormData.role}
                  onValueChange={(value) => handleSelectChange(value, "role", "create")}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    value={updateFormData.firstName}
                    onChange={handleUpdateInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    value={updateFormData.lastName}
                    onChange={handleUpdateInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  name="username"
                  value={updateFormData.username}
                  onChange={handleUpdateInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={updateFormData.email}
                  onChange={handleUpdateInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={updateFormData.role}
                  onValueChange={(value) => handleSelectChange(value, "role", "update")}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={updateFormData.active}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked as boolean, "active")
                  }
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetUpdateForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for this user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Password must be at least 6 characters long.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false);
                  setNewPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending || newPassword.length < 6}
              >
                {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
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

export default DashboardUsers;
