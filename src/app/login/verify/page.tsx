import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { LoginOtpVerification } from "@/components/auth/LoginOtpVerification";
import styles from "./verify.module.css";

export const metadata: Metadata = {
  title: "Verify Login Code | Manglam Matrimony",
  description: "Enter your 6-digit verification code to log in securely to your Manglam Matrimony account.",
};

export default function LoginVerifyPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Top Header Bar */}
      <header className={styles.topBar}>
        <Logo size="md" />

        <div className={styles.registerPrompt}>
          <span>New to Manglam?</span>
          <Link href="/register" className={styles.registerButton}>
            Register Free
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
                src="/images/login-hero-couple.jpg"
                alt="Indian couple smiling warmly in traditional attire"
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
              <LoginOtpVerification />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className={styles.bottomNote}>
        <p>
          © {new Date().getFullYear()} Manglam Matrimony. All rights reserved. Built with privacy and trust.
        </p>
      </footer>
    </div>
  );
}
