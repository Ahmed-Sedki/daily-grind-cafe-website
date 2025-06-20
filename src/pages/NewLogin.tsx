import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNewAuth } from "@/contexts/NewAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NewLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  const { login, emergencyLogin, isAuthenticated } = useNewAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both username and password",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Login will automatically get CSRF token first
      await login(username, password);
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled in the auth context
      setIsLoading(false);
    }
  };

  // Handle emergency admin login
  const handleEmergencyLogin = async () => {
    try {
      setIsEmergencyLoading(true);
      console.log('Attempting emergency login from component');
      await emergencyLogin();
      console.log('Emergency login successful, navigating to dashboard');
      navigate("/dashboard");
    } catch (error) {
      console.error('Emergency login error in component:', error);
      // Error is already handled in the auth context
      setIsEmergencyLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-amber-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-green-600 text-green-700 hover:bg-green-50"
                disabled={isEmergencyLoading}
                onClick={handleEmergencyLogin}
              >
                {isEmergencyLoading ? "Emergency login..." : "Emergency Admin Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default NewLogin;
