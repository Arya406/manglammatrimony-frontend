import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import styles from "./register.module.css";

export const metadata: Metadata = {
  title: "Register Free | Manglam Matrimony",
  description:
    "Create your Manglam Matrimony account with your mobile number or email. Discover verified profiles aligned with your values.",
  openGraph: {
    title: "Register Free | Manglam Matrimony",
    description:
      "Create your Manglam Matrimony account with your mobile number or email. Discover verified profiles aligned with your values.",
    type: "website",
    locale: "en_IN",
    siteName: "Manglam Matrimony",
  },
};

export default function RegisterPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Top Header Bar */}
      <header className={styles.topBar}>
        <Logo size="md" />

        <div className={styles.loginPrompt}>
          <span>Already a member?</span>
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        </div>
      </header>

      {/* Main Registration Content */}
      <main className={styles.mainSection}>
        <div className={styles.authGrid}>
          {/* Left Column: Matrimonial Couple Visual */}
          <div className={styles.visualColumn}>
            <div className={styles.imageArchWrapper}>
              <Image
                src="/images/hero-couple.jpg"
                alt="Indian couple smiling warmly in traditional festive attire"
                fill
                priority
                sizes="(max-width: 960px) 0vw, 500px"
                className={styles.heroImage}
              />
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className={styles.formColumn}>
            <div className={styles.cardWrapper}>
              <RegisterForm />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className={styles.bottomNote}>
        <p>© {new Date().getFullYear()} Manglam Matrimony. All rights reserved. Built with privacy and trust.</p>
      </footer>
    </div>
  );
}
