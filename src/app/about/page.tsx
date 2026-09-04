import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { AboutHero } from "@/components/about/AboutHero";
import { PhilosophySection } from "@/components/about/PhilosophySection";
import { AboutWhyManglam } from "@/components/about/AboutWhyManglam";
import { ApproachTimeline } from "@/components/about/ApproachTimeline";
import { TechHumanTouch } from "@/components/about/TechHumanTouch";
import { AboutFinalCta } from "@/components/about/AboutFinalCta";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Manglam Matrimony — About Us",
  description:
    "Learn about Manglam Matrimony, our philosophy on meaningful matchmaking, authentic family values, and thoughtful approach to lifelong companionship.",
  openGraph: {
    title: "Manglam Matrimony — About Us",
    description:
      "Learn about Manglam Matrimony, our philosophy on meaningful matchmaking, authentic family values, and thoughtful approach to lifelong companionship.",
    type: "website",
    locale: "en_IN",
    siteName: "Manglam Matrimony",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* 1. Dynamic SiteHeader */}
      <SiteHeader />

      <main id="main-content">
        {/* 2. About Hero */}
        <AboutHero />

        {/* 3. Philosophy Section */}
        <PhilosophySection />

        {/* 4. Why Manglam Section */}
        <AboutWhyManglam />

        {/* 5. Our Approach Timeline */}
        <ApproachTimeline />

        {/* 6. Technology + Human Touch Section */}
        <TechHumanTouch />

        {/* 7. Final CTA */}
        <AboutFinalCta />
      </main>

      {/* 8. Existing Footer */}
      <Footer />
    </>
  );
}
