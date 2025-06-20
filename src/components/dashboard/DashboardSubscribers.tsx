import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Search, Trash2, Users, Calendar, UserPlus, UserMinus } from "lucide-react";
import subscriberService, { Subscriber } from "@/services/subscriber.service";

const DashboardSubscribers = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subscribers
  const { data: subscriberData, isLoading } = useQuery({
    queryKey: ['subscribers', page, status, search, source],
    queryFn: async () => {
      const response = await subscriberService.getSubscribers(page, 10, status, search, source);
      return response.data;
    },
  });

  // Fetch subscriber statistics
  const { data: statsData } = useQuery({
    queryKey: ['subscriber-stats'],
    queryFn: async () => {
      const response = await subscriberService.getSubscriberStats();
      return response.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      subscriberService.updateSubscriberStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscriber-stats'] });
      toast({
        title: "Status Updated",
        description: "Subscriber status has been updated successfully.",
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

  // Delete subscriber mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriberService.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscriber-stats'] });
      toast({
        title: "Subscriber Deleted",
        description: "Subscriber has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete subscriber.",
      });
    },
  });

  const handleStatusUpdate = (subscriberId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: subscriberId, status: newStatus });
  };

  const handleDelete = (subscriberId: string) => {
    if (window.confirm("Are you sure you want to delete this subscriber?")) {
      deleteMutation.mutate(subscriberId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'unsubscribed': return 'bg-red-500';
      case 'bounced': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'footer': return 'bg-blue-500';
      case 'contact-page': return 'bg-purple-500';
      case 'popup': return 'bg-orange-500';
      case 'manual': return 'bg-gray-500';
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
        <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.active}</div>
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
              <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.byStatus.unsubscribed || 0}</div>
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
                  placeholder="Search by email..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="contact-page">Contact Page</SelectItem>
                <SelectItem value="popup">Popup</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
          <CardDescription>
            {subscriberData?.pagination.total || 0} total subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading subscribers...</div>
          ) : subscriberData?.subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscribers found.
            </div>
          ) : (
            <div className="space-y-4">
              {subscriberData?.subscribers.map((subscriber: Subscriber) => (
                <div
                  key={subscriber._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{subscriber.email}</h3>
                        <Badge className={`${getStatusColor(subscriber.status)} text-white`}>
                          {subscriber.status}
                        </Badge>
                        <Badge className={`${getSourceColor(subscriber.source)} text-white`}>
                          {subscriber.source}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Subscribed: {formatDate(subscriber.subscribedAt)}
                      </p>
                      {subscriber.unsubscribedAt && (
                        <p className="text-sm text-muted-foreground">
                          Unsubscribed: {formatDate(subscriber.unsubscribedAt)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Emails sent: {subscriber.emailsSent}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={subscriber.status}
                        onValueChange={(value) => handleStatusUpdate(subscriber._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          <SelectItem value="bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscriber._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {subscriber.notes && (
                    <p className="text-sm text-muted-foreground">
                      Notes: {subscriber.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {subscriberData && subscriberData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!subscriberData.pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {subscriberData.pagination.currentPage} of {subscriberData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!subscriberData.pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSubscribers;
