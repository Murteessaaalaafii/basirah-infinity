import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ADMIN_PRIMARY_EMAIL } from "@/integrations/firebase/helpers";

export type AppRole = "admin" | "assistant" | "client" | "partner";

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthCtx {
  user: UserSession | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setCustomSession: (user: UserSession, role: AppRole) => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  setCustomSession: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local custom admin session if any
    let customUser: UserSession | null = null;
    let customRole: AppRole | null = null;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("bi_custom_session");
        if (stored) {
          customUser = JSON.parse(stored);
          const storedRole = localStorage.getItem(`bi_role_${customUser?.uid}`) as AppRole | null;
          customRole = storedRole || (customUser?.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase() ? "admin" : "client");
        }
      } catch (e) {}
    }

    if (customUser) {
      setUser(customUser);
      setRole(customRole);
      setLoading(false);
    }

    // 2. Listen to Firebase auth state
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj: UserSession = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          photoURL: fbUser.photoURL,
        };
        setUser(userObj);

        if (fbUser.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
          setRole("admin");
        } else {
          let foundRole: AppRole = "client";
          if (typeof window !== "undefined") {
            const lr = localStorage.getItem(`bi_role_${fbUser.uid}`) as AppRole | null;
            if (lr) foundRole = lr;
          }
          try {
            const snap = await getDoc(doc(db, "user_roles", fbUser.uid));
            const roles = snap.exists() ? (snap.data()?.roles as string[]) ?? [] : [];
            if (roles.includes("admin")) foundRole = "admin";
            else if (roles.includes("partner")) foundRole = "partner";
            else if (roles.includes("assistant")) foundRole = "assistant";
            else if (roles.includes("client")) foundRole = "client";
          } catch (e) {}
          setRole(foundRole);
        }
      } else if (!customUser) {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const setCustomSession = (sessUser: UserSession, sessRole: AppRole) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bi_custom_session", JSON.stringify(sessUser));
      localStorage.setItem(`bi_role_${sessUser.uid}`, sessRole);
    }
    setUser(sessUser);
    setRole(sessRole);
  };

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bi_custom_session");
    }
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setUser(null);
    setRole(null);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        role,
        loading,
        signOut: handleSignOut,
        setCustomSession,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
