
import { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useNewAuth } from "@/contexts/NewAuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DashboardHome from "@/components/dashboard/DashboardHome";
import DashboardAnnouncements from "@/components/dashboard/DashboardAnnouncements";
import DashboardMenu from "@/components/dashboard/DashboardMenu";
import DashboardGallery from "@/components/dashboard/DashboardGallery";
import DashboardFAQ from "@/components/dashboard/DashboardFAQ";
import DashboardCategories from "@/components/dashboard/DashboardCategories";
import DashboardUsers from "@/components/dashboard/DashboardUsers";
import DashboardContacts from "@/components/dashboard/DashboardContacts";
import DashboardSubscribers from "@/components/dashboard/DashboardSubscribers";

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useNewAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Guard access - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Update active tab based on path
  useEffect(() => {
    const path = location.pathname.split("/")[2] || "overview";
    setActiveTab(path);
  }, [location.pathname]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-amber-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">L Café</Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user.firstName || user.username}
            </span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-transparent border-white text-white hover:bg-amber-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-amber-50 border-r border-amber-100 p-4">
          <h2 className="text-lg font-semibold text-amber-800 mb-4">Dashboard</h2>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-md ${
                activeTab === "overview"
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              Overview
            </Link>

            <Link
              to="/dashboard/announcements"
              className={`block px-4 py-2 rounded-md ${
                activeTab === "announcements"
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              Announcements
            </Link>

            <Link
              to="/dashboard/menu"
              className={`block px-4 py-2 rounded-md ${
                activeTab === "menu"
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              Menu Items
            </Link>

            <Link
              to="/dashboard/gallery"
              className={`block px-4 py-2 rounded-md ${
                activeTab === "gallery"
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              Gallery
            </Link>

            <Link
              to="/dashboard/faq"
              className={`block px-4 py-2 rounded-md ${
                activeTab === "faq"
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              FAQ
            </Link>

            <Link
              to="/dashboard/categories"
              className={`block px-4 py-2 rounded-md ${
                activeTab === "categories"
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              Categories
            </Link>

            {user.role === "admin" && (
              <>
                <Separator className="my-2" />
                <h3 className="px-4 text-sm font-medium text-amber-900">Admin</h3>
                <Link
                  to="/dashboard/users"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "users"
                      ? "bg-amber-200 text-amber-900"
                      : "text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/dashboard/contacts"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "contacts"
                      ? "bg-amber-200 text-amber-900"
                      : "text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Contact Messages
                </Link>
                <Link
                  to="/dashboard/subscribers"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "subscribers"
                      ? "bg-amber-200 text-amber-900"
                      : "text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Subscribers
                </Link>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6 bg-white">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/announcements" element={<DashboardAnnouncements />} />
            <Route path="/menu" element={<DashboardMenu />} />
            <Route path="/gallery" element={<DashboardGallery />} />
            <Route path="/faq" element={<DashboardFAQ />} />
            <Route path="/categories" element={<DashboardCategories />} />
            <Route path="/users" element={<DashboardUsers />} />
            <Route path="/contacts" element={<DashboardContacts />} />
            <Route path="/subscribers" element={<DashboardSubscribers />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
