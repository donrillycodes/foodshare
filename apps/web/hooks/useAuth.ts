"use client";

import { useState, useEffect, useCallback } from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { onAuthChange, logOut } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { type User } from "@/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const response = await authApi.getMe();
      const user: User = response.data.data.user;

      // Verify the user has the right role for this dashboard
      // This dashboard is for NGO and Admin users only
      if (user.role === "DONOR") {
        await logOut();
        setState({
          firebaseUser: null,
          user: null,
          loading: false,
          error: "This dashboard is for NGO and Admin users only.",
        });
        return;
      }

      setState({
        firebaseUser,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        firebaseUser: null,
        user: null,
        loading: false,
        error: "Failed to load user profile. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUser(firebaseUser);
      } else {
        setState({
          firebaseUser: null,
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    try {
      await logOut();
      setState({
        firebaseUser: null,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Sign out failed", error);
    }
  }, []);

  // Permission helpers — clean way to check permissions in components
  const can = {
    approveNgos: state.user?.canApproveNgos ?? false,
    manageUsers: state.user?.canManageUsers ?? false,
    manageContent: state.user?.canManageContent ?? false,
    viewAnalytics: state.user?.canViewAnalytics ?? false,
    manageAdmins: state.user?.canManageAdmins ?? false,
    manageDonations: state.user?.canManageDonations ?? false,
  };

  const isNGO = state.user?.role === "NGO";
  const isAdmin = state.user?.role === "ADMIN";
  const isSuperAdmin = state.user?.role === "SUPER_ADMIN";
  const isAdminOrAbove = isAdmin || isSuperAdmin;

  return {
    ...state,
    signOut,
    can,
    isNGO,
    isAdmin,
    isSuperAdmin,
    isAdminOrAbove,
  };
}
