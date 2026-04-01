import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

type AuthMode = "choose" | "email-signin" | "email-register";

export default function Landing() {
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("choose");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });

  const handleGoogleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/login/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Sign In Failed", description: data.message || "Invalid credentials.", variant: "destructive" });
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast({ title: "Password Too Short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration Failed", description: data.message || "Could not create account.", variant: "destructive" });
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border relative">

        {/* Hero Section */}
        <div className="text-center pt-12 pb-8 px-6 hero-section">
          <img
            src={logoPath}
            alt="ArcSide Mobile App"
            className="h-32 w-auto mx-auto mb-6 object-contain rounded-xl logo-glow"
            data-testid="img-arcside-logo-hero"
          />
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
            The App Made by Tradesmen for Tradesmen
          </Badge>
        </div>

        {/* Auth Section */}
        {mode === "choose" && (
          <>
            {/* Features */}
            <div className="px-6 mb-8">
              <div className="grid gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-search text-primary"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">AI Defect Analysis</h3>
                        <p className="text-xs text-muted-foreground">Identify and solve weld defects with AI-powered analysis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-file-alt text-accent"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">WPS Generation</h3>
                        <p className="text-xs text-muted-foreground">Generate professional welding procedures automatically</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-chart-1/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-layer-group text-chart-1"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">Material Compatibility</h3>
                        <p className="text-xs text-muted-foreground">Check material combinations and get expert recommendations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <i className="fas fa-robot text-primary-foreground"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">AI Weld Assistant</h3>
                        <p className="text-xs text-muted-foreground">Get instant answers to any welding question from our AI expert</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Trusted By */}
            <div className="px-6 mb-8">
              <p className="text-center text-xs text-muted-foreground mb-4">Trusted by welding professionals worldwide</p>
              <div className="flex justify-center space-x-6 text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-bold">10K+</div>
                  <div className="text-xs">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">50K+</div>
                  <div className="text-xs">Analyses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">1K+</div>
                  <div className="text-xs">WPS Generated</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-4">
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-base font-semibold"
                data-testid="button-login-google"
              >
                <i className="fab fa-google mr-2"></i>
                Continue with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-background px-2">or use email</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMode("email-signin")}
                  className="h-11"
                  data-testid="button-show-signin"
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMode("email-register")}
                  className="h-11"
                  data-testid="button-show-register"
                >
                  Register
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  ArcSide is in closed beta. Access is invite-only.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Email Sign In */}
        {mode === "email-signin" && (
          <div className="px-6 pb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Sign In</h2>
              <p className="text-sm text-muted-foreground">Enter your email and password to access ArcSide.</p>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                  data-testid="input-signin-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  data-testid="input-signin-password"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading} data-testid="button-signin-submit">
                {isLoading ? "Signing In…" : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center">
              <button
                onClick={() => setMode("email-register")}
                className="text-xs text-primary hover:underline"
                data-testid="link-switch-to-register"
              >
                Don't have an account? Register
              </button>
              <div className="block">
                <button
                  onClick={handleGoogleLogin}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-back-to-google"
                >
                  Or continue with Google
                </button>
              </div>
              <div className="block">
                <button
                  onClick={() => setMode("choose")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-back-to-choose"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Register */}
        {mode === "email-register" && (
          <div className="px-6 pb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Create Account</h2>
              <p className="text-sm text-muted-foreground">Register with your email. Beta access is invite-only.</p>
            </div>
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jan"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    autoComplete="given-name"
                    data-testid="input-register-firstname"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Botha"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    autoComplete="family-name"
                    data-testid="input-register-lastname"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                  data-testid="input-register-password"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading} data-testid="button-register-submit">
                {isLoading ? "Creating Account…" : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center">
              <button
                onClick={() => setMode("email-signin")}
                className="text-xs text-primary hover:underline"
                data-testid="link-switch-to-signin"
              >
                Already have an account? Sign In
              </button>
              <div className="block">
                <button
                  onClick={() => setMode("choose")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-back-to-choose-reg"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-6 px-6 space-y-2 mt-4">
          <p className="text-xs text-muted-foreground">
            © 2025 ArcSide™ - Professional Welding Solutions
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:info@arcside.co.za" className="text-xs text-primary hover:underline flex items-center gap-1" data-testid="link-footer-email">
              <i className="fas fa-envelope text-[10px]"></i>
              info@arcside.co.za
            </a>
            <a href="tel:+27796819319" className="text-xs text-primary hover:underline flex items-center gap-1" data-testid="link-footer-phone">
              <i className="fas fa-phone text-[10px]"></i>
              +27 79 681 9319
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
