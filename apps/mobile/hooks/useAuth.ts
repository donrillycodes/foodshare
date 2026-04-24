import { useEffect } from "react";
import { onAuthChange, logOut, getToken } from "../lib/firebase";
import { authApi } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    setToken,
    setLoading,
    signOut: clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await getToken();
          setToken(token);

          const response = await authApi.getMe();
          const dbUser: User = response.data.data.user;
          setUser(dbUser);
        } catch (error) {
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await logOut();
      clearAuth();
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
    isNGO: user?.role === "NGO",
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
  };
}
