"use client";

import { User } from "@/types/entities/user";
import { signIn, signOut, useSession } from "next-auth/react";

/**
 * Hook personalizado para gestión de autenticación
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user as User | undefined;

  const login = async (email: string, password: string) => {
    console.log("Login attempt:", { email, password });
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user?.permissions) return false;

    return user.permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;

    return user.roles.some((role) => role.name === roleName);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
  };
}
