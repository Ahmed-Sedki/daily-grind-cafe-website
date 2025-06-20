
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import authService from "@/services/auth.service";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectLoginLoading, setIsDirectLoginLoading] = useState(false);
  const [isEmergencyLoginLoading, setIsEmergencyLoginLoading] = useState(false);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    // Ensure the form doesn't submit normally
    if (e) e.preventDefault();

    console.log('Login handler called');

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
      console.log('Attempting login with:', { username, password: '***' });

      // Pre-fetch CSRF token before login
      try {
        await authService.getCsrfToken();
      } catch (csrfError) {
        console.warn('Failed to get CSRF token before login, continuing anyway:', csrfError);
      }

      // Attempt login
      await login(username, password);
      console.log('Login successful, navigating to dashboard');
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error in component:', error);

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please try using the Direct Login or Emergency Login buttons below.",
      });

      setIsLoading(false);
    }
  };

  // Direct login bypassing context for troubleshooting
  const handleDirectLogin = async (e: React.MouseEvent) => {
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
      setIsDirectLoginLoading(true);

      // Use the direct login method from auth service
      const response = await authService.directLogin({
        username,
        password
      });

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.firstName || username}!`,
      });

      // Manually update local storage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userId', response.user._id);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Direct login failed",
        description: error.response?.data?.message || 'An error occurred during login',
      });
      setIsDirectLoginLoading(false);
    }
  };

  // Verify admin credentials for debugging
  const verifyAdminCredentials = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setIsVerifyingCredentials(true);
      setDebugInfo(null);

      // Use the auth service to verify credentials
      const data = await authService.verifyAdminCredentials(password || 'Admin123!');

      // Store debug info
      setDebugInfo(data);

      toast({
        title: data.isMatch ? "Password is correct" : "Password is incorrect",
        description: `Admin user details retrieved. Check console for more info.`,
      });

      console.log('Admin credential verification result:', data);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || 'An error occurred during verification',
      });
      console.error('Verification error:', error);
    } finally {
      setIsVerifyingCredentials(false);
    }
  };

  // Emergency admin login for troubleshooting
  const handleEmergencyLogin = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setIsEmergencyLoginLoading(true);

      // Use the auth service for emergency login
      const data = await authService.emergencyAdminLogin();

      toast({
        title: "Emergency Login Successful",
        description: `Logged in as admin using emergency access.`,
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Emergency Login Failed",
        description: error.message || 'An error occurred during emergency login',
      });
      setIsEmergencyLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(e);
                  return false; // Ensure the form doesn't submit
                }}>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
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
                    type="button" // Changed from submit to button
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogin(e);
                    }}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>

                  {/* Emergency direct login button for troubleshooting */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-600 text-amber-700 hover:bg-amber-50"
                    disabled={isDirectLoginLoading}
                    onClick={handleDirectLogin}
                  >
                    {isDirectLoginLoading ? "Trying direct login..." : "Try Direct Login (Bypass CSRF)"}
                  </Button>

                  {/* Emergency admin login button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-600 text-green-700 hover:bg-green-50"
                    disabled={isEmergencyLoginLoading}
                    onClick={handleEmergencyLogin}
                  >
                    {isEmergencyLoginLoading ? "Emergency login..." : "Emergency Admin Login"}
                  </Button>

                  {/* Verify admin credentials button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-blue-600 text-blue-700 hover:bg-blue-50"
                    disabled={isVerifyingCredentials}
                    onClick={verifyAdminCredentials}
                  >
                    {isVerifyingCredentials ? "Verifying..." : "Verify Admin Credentials"}
                  </Button>

                  {/* Debug info display */}
                  {debugInfo && (
                    <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                      <p><strong>Admin:</strong> {debugInfo.adminDetails?.username}</p>
                      <p><strong>Match:</strong> {debugInfo.isMatch ? 'Yes' : 'No'}</p>
                      <p><strong>Active:</strong> {debugInfo.adminDetails?.active ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
