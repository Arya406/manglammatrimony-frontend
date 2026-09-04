import { AuthHomeRedirect } from "@/components/auth/AuthHomeRedirect";
import { Navbar } from "@/components/navbar/Navbar";
import { Hero } from "@/components/hero/Hero";
import { TrustStats } from "@/components/trust-stats/TrustStats";
import { HowItWorks } from "@/components/how-it-works/HowItWorks";
import { WhyManglam } from "@/components/why-manglam/WhyManglam";
import { SuccessStories } from "@/components/success-stories/SuccessStories";
import { FinalCta } from "@/components/final-cta/FinalCta";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      {/* Client-side guard: redirect logged-in users to /matches */}
      <AuthHomeRedirect />

      {/* 1. Navbar */}
      <Navbar />

      <main id="main-content">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Trust / Statistics Section */}
        <TrustStats />

        {/* 4. How Manglam Works */}
        <HowItWorks />

        {/* 5. Why Choose Manglam */}
        <WhyManglam />

        {/* 6. Success Stories */}
        <SuccessStories />

        {/* 7. Final CTA */}
        <FinalCta />
      </main>

      {/* 8. Footer */}
      <Footer />
    </>
  );
}
