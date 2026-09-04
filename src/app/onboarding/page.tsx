"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfileCreatedForSelector } from "@/components/onboarding/ProfileCreatedForSelector";

export default function OnboardingScreen1Page() {
  const router = useRouter();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [router, authStatus]);

  return (
    <OnboardingLayout>
      <ProfileCreatedForSelector />
    </OnboardingLayout>
  );
}
