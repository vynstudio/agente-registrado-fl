import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { AlertCircleIcon, CheckmarkCircle02Icon } from "hugeicons-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import heroVideo from "@/assets/login-video.mp4";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be less than 72 characters" })
  .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
  .regex(/[0-9]/, { message: "Password must include a number" });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
    };
    checkSession();

    // Listen for auth state changes (recovery link click)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      setError(parsedPassword.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
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
        <main id="main-content" tabIndex={-1} className="w-full lg:w-1/2 flex flex-col p-4 sm:p-6 lg:p-12 lg:pr-[180px]">
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
          <Link to="/" className="flex items-center mb-8 sm:mb-12 lg:mb-20">
            <span className="text-[17px] font-semibold text-foreground whitespace-nowrap">Agente Registrado <span className="text-lime">Florida</span></span>
          </Link>

          {/* Form container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[360px] mx-auto lg:mx-0"
          >
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            {!isValidSession ? (
              <div className="space-y-5">
                <Alert>
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Invalid or expired reset link. Please request a new password reset.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate("/admin/login")}
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full uppercase tracking-wide"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
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
                  <Label htmlFor="password" className="text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 bg-background border-border"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  <Link
                    to="/admin/login"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to login
                  </Link>
                </p>
              </form>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ResetPassword;
