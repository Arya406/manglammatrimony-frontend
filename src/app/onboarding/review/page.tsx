"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfileReview } from "@/components/onboarding/ProfileReview";

export default function ReviewPage() {
  const router = useRouter();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [router, authStatus]);

  return (
    <OnboardingLayout onSaveAndExit={() => router.push("/matches")}>
      <ProfileReview />
    </OnboardingLayout>
  );
}
