import { useEffect } from 'react';

export function useKeepAlive() {
  useEffect(() => {
    // Send a keep-alive ping every 30 seconds to prevent Replit from sleeping
    const keepAliveInterval = setInterval(async () => {
      try {
        await fetch('/api/auth/user', { method: 'GET' });
      } catch (error) {
        // Silently fail - this is just a keep-alive ping
      }
    }, 30000); // 30 seconds

    return () => clearInterval(keepAliveInterval);
  }, []);
}
