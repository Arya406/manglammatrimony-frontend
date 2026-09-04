"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { EducationCareerForm } from "@/components/onboarding/EducationCareerForm";

export default function EducationCareerPage() {
  const router = useRouter();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [router, authStatus]);

  return (
    <OnboardingLayout>
      <React.Suspense fallback={<div style={{ minHeight: "400px" }} />}>
        <EducationCareerForm />
      </React.Suspense>
    </OnboardingLayout>
  );
}
