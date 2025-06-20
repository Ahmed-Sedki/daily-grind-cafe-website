
import { useNewAuth } from "@/contexts/NewAuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import visitorService from "@/services/visitor.service";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const { user } = useNewAuth();
  const { onlineUsers, isConnected } = useSocket();

  const { data: visitorCount, isLoading: isVisitorLoading } = useQuery({
    queryKey: ['visitor-count'],
    queryFn: async () => {
      const response = await visitorService.getVisitorCount();
      return response.data.count;
    },
  });

  // Note: Online users count is now handled by Socket.IO in real-time
  // No need for polling - the useSocket hook provides real-time updates

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Visitors</CardTitle>
            <CardDescription>All-time visitor count</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">
              {isVisitorLoading ? "..." : visitorCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Online Now</CardTitle>
            <CardDescription>Current active users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">
              {onlineUsers}
              {!isConnected && (
                <span className="text-sm text-gray-500 ml-2">(offline)</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Account Type</CardTitle>
            <CardDescription>Your account status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700 capitalize">{user?.role || "Staff"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Admin Dashboard</CardTitle>
            <CardDescription>Manage your café's digital presence</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              From this dashboard, you can manage your café's content, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Update announcements and news</li>
              <li>Modify menu items and categories</li>
              <li>Manage the photo gallery</li>
              <li>Answer customer questions in the FAQ section</li>
              {user?.role === "admin" && <li>Manage user accounts and permissions</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Select one of these quick links to get started:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/dashboard/announcements" className="px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-800 text-center transition-all duration-200 hover:shadow-md">
                Manage Announcements
              </Link>
              <Link to="/dashboard/menu" className="px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-800 text-center transition-all duration-200 hover:shadow-md">
                Update Menu
              </Link>
              <Link to="/dashboard/gallery" className="px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-800 text-center transition-all duration-200 hover:shadow-md">
                Gallery Management
              </Link>
              <Link to="/dashboard/faq" className="px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-800 text-center transition-all duration-200 hover:shadow-md">
                Review Customer Questions
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
