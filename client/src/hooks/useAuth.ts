import { useQuery } from "@tanstack/react-query";

const BETA_TESTING_MODE = true; // Set to false to re-enable subscription locks

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // In beta testing mode, grant premium access to all users
  const enhancedUser = user ? {
    ...user,
    subscriptionTier: BETA_TESTING_MODE ? 'premium' : (user.subscriptionTier || 'free'),
  } : user;

  return {
    user: enhancedUser,
    isLoading,
    isAuthenticated: !!user,
  };
}
