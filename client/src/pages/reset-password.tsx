import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    if (!token) {
      toast({ title: "Invalid Link", description: "This reset link is missing a token. Please request a new one.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Reset Failed", description: data.message || "Could not reset password.", variant: "destructive" });
        return;
      }
      setDone(true);
    } catch {
      toast({ title: "Network Error", description: "Could not reach the server. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border relative">

        <div className="text-center pt-12 pb-8 px-6">
          <img
            src={logoPath}
            alt="ArcSide"
            className="h-24 w-auto mx-auto mb-6 object-contain rounded-xl logo-glow"
            data-testid="img-reset-logo"
          />
        </div>

        <div className="px-6 pb-8">
          {done ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <i className="fas fa-check text-green-500 text-xl"></i>
                </div>
                <h2 className="text-lg font-bold">Password Updated</h2>
                <p className="text-sm text-muted-foreground">Your password has been changed successfully. You can now sign in with your new password.</p>
                <Button className="w-full" onClick={() => navigate("/")} data-testid="button-goto-signin">
                  Go to Sign In
                </Button>
              </CardContent>
            </Card>
          ) : !token ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                  <i className="fas fa-exclamation-triangle text-destructive text-xl"></i>
                </div>
                <h2 className="text-lg font-bold">Invalid Reset Link</h2>
                <p className="text-sm text-muted-foreground">This link is invalid or has expired. Please request a new password reset from the sign-in page.</p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")} data-testid="button-back-from-invalid">
                  Back to Sign In
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">Set New Password</h2>
                <p className="text-sm text-muted-foreground">Choose a strong password for your ArcSide account.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min. 8 characters" autoComplete="new-password" data-testid="input-new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repeat your password" autoComplete="new-password" data-testid="input-confirm-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting} data-testid="button-reset-submit">
                    {form.formState.isSubmitting ? "Updating…" : "Update Password"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="button-cancel-reset">
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center pb-6 px-6 mt-4">
          <p className="text-xs text-muted-foreground">© 2025 ArcSide™ — Professional Welding Solutions</p>
        </div>
      </div>
    </div>
  );
}
