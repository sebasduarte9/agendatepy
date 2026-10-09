import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { isPhoneVerificationRequired } from "@/lib/verification/phone-otp";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Creá tu página de reservas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [session, verificationRequired] = await Promise.all([getSession(), isPhoneVerificationRequired()]);
  const account = session?.email ? { email: session.email, name: session.name || "" } : null;

  return <OnboardingWizard account={account} verificationRequired={verificationRequired} />;
}
