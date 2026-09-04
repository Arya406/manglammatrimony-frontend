import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { OtpVerification } from "@/components/auth/OtpVerification";
import styles from "./verify.module.css";

export const metadata: Metadata = {
  title: "Verify Code | Manglam Matrimony",
  description: "Enter your 6-digit verification code to complete registration.",
};

export default function RegisterVerifyPage() {
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

      {/* Main Verification Content */}
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

          {/* Right Column: Verification Card */}
          <div className={styles.formColumn}>
            <div className={styles.cardWrapper}>
              <OtpVerification />
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
