import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Search, Eye, Trash2, MessageSquare, Calendar, User } from "lucide-react";
import contactService, { ContactMessage } from "@/services/contact.service";

const DashboardContacts = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact messages
  const { data: contactData, isLoading } = useQuery({
    queryKey: ['contact-messages', page, status, search],
    queryFn: async () => {
      const response = await contactService.getContactMessages(page, 10, status, search);
      return response.data;
    },
  });

  // Fetch contact statistics
  const { data: statsData } = useQuery({
    queryKey: ['contact-stats'],
    queryFn: async () => {
      const response = await contactService.getContactStats();
      return response.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      contactService.updateContactStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast({
        title: "Status Updated",
        description: "Contact message status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update status.",
      });
    },
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactService.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast({
        title: "Message Deleted",
        description: "Contact message has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete message.",
      });
    },
  });

  const handleStatusUpdate = (messageId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: messageId, status: newStatus });
  };

  const handleDelete = (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate(messageId);
    }
  };

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      handleStatusUpdate(message._id, 'read');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'read': return 'bg-yellow-500';
      case 'replied': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.byStatus.new || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Replied</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.byStatus.replied || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            {contactData?.pagination.total || 0} total messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : contactData?.messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages found.
            </div>
          ) : (
            <div className="space-y-4">
              {contactData?.messages.map((message: ContactMessage) => (
                <div
                  key={message._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{message.name}</h3>
                        <Badge className={`${getStatusColor(message.status)} text-white`}>
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(message)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={message.status}
                        onValueChange={(value) => handleStatusUpdate(message._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(message._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">{message.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {contactData && contactData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!contactData.pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {contactData.pagination.currentPage} of {contactData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!contactData.pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Contact message from {selectedMessage?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={`${getStatusColor(selectedMessage.status)} text-white`}>
                    {selectedMessage.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              {selectedMessage.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm">{selectedMessage.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardContacts;
