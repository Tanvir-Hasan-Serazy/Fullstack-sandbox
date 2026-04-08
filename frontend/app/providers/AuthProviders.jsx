"use client";
import { useSession } from "@/hooks/queries/useSession";
import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const session = useSession();

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use context
export const useAuth = () => useContext(AuthContext);
