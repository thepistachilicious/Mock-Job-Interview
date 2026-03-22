"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, AuthUser } from "@/api/authService";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return; // no token → skip the /me call entirely
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      setUser(null); // token expired or invalid → treat as logged out
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser().finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);