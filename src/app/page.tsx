import { AuthHomeRedirect } from "@/components/auth/AuthHomeRedirect";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { HowItWorks } from "@/components/how-it-works/HowItWorks";
import { Footer } from "@/components/footer/Footer";
import { SuccessStories } from "@/components/success-stories/SuccessStories";
import { FinalCta } from "@/components/final-cta/FinalCta";

export default function Home() {
  return (
    <>
      {/* Client-side guard: redirect logged-in users to /matches */}
      <AuthHomeRedirect />

      <main id="main-content">
        {/* Full-viewport cinematic video hero with overlay header */}
        <CinematicHero />

        {/* Start Your Journey Today — 4-Card Sequential Journey */}
        <HowItWorks />

        {/* Success Stories */}
        <SuccessStories />

        <FinalCta/>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
