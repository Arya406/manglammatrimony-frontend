"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Client-side guard for the root public landing page.
 * If an active validated user session exists, automatically redirects to the appropriate destination.
 */
export function AuthHomeRedirect() {
  const router = useRouter();
  const { authStatus, profileStatus } = useAuth();

  useEffect(() => {
    if (authStatus === "AUTHENTICATED") {
      if (profileStatus === "IN_REVIEW") {
        router.replace("/onboarding/review");
      } else if (profileStatus === "INCOMPLETE") {
        router.replace("/onboarding");
      } else {
        router.replace("/matches");
      }
    }
  }, [router, authStatus, profileStatus]);

  return null;
}
