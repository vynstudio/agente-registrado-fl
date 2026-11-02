import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { AlertCircleIcon, CheckmarkCircle02Icon } from "hugeicons-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import heroVideo from "@/assets/login-video.mp4";

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be less than 72 characters" })
  .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
  .regex(/[0-9]/, { message: "Password must include a number" });


const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signIn(parsed.data, password);
      if (error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }
      navigate("/admin/posts");
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setError(parsedEmail.error.issues[0].message);
      return;
    }
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      setError(parsedPassword.error.issues[0].message);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: parsedEmail.data,
        password: parsedPassword.data,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      setSuccess("Account created! Check your email to confirm it, then sign in. The first account on a new site becomes the admin; otherwise an admin must grant you access.");
      setEmail("");
      setPassword("");
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      setSuccess("Password reset link sent! Check your email inbox.");
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-dvh bg-background relative">
      {/* Content container - centered with max-width */}
      <div className="max-w-[1280px] mx-auto min-h-dvh flex">
        {/* Left side - Form */}
        <main id="main-content" tabIndex={-1} className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 lg:pr-[180px]">
          {/* Video - decorative, positioned to cover right half of viewport */}
          <div aria-hidden="true" className="hidden lg:block fixed top-0 right-0 w-1/2 h-full bg-black">
            <video
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {/* Logo */}
          <Link to="/" className="flex items-center mb-12 lg:mb-20">
            <span className="text-[17px] font-semibold text-foreground whitespace-nowrap">Agente Registrado <span className="text-lime">Florida</span></span>
          </Link>

          {/* Form container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[360px]"
          >
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {activeTab === "forgot" ? "Reset Password" : "Admin Access"}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === "forgot"
                  ? "Enter your email to receive a reset link"
                  : "Sign in or create an account to request admin access"}
              </p>
            </div>

            {/* Custom Tab Toggle */}
            {activeTab !== "forgot" && (
              <div className="flex bg-muted rounded-lg p-1 mb-8 h-11">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 flex items-center justify-center rounded-md text-base font-medium transition-all ${
                    activeTab === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 flex items-center justify-center rounded-md text-base font-medium transition-all ${
                    activeTab === "signup"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-10 bg-background border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 bg-background border-border"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Remember
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("forgot");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full uppercase tracking-wide"
                  disabled={isLoading || authLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-lime bg-lime/10">
                    <CheckmarkCircle02Icon className="h-4 w-4 text-lime" />
                    <AlertDescription className="text-foreground">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-10 bg-background border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 bg-background border-border"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters, with upper and lowercase letters and a number
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full uppercase tracking-wide"
                  disabled={isLoading || authLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  The first account becomes the admin. Later accounts need an admin to grant access.
                </p>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-lime bg-lime/10">
                    <CheckmarkCircle02Icon className="h-4 w-4 text-lime" />
                    <AlertDescription className="text-foreground">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-10 bg-background border-border"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full uppercase tracking-wide"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to login
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;