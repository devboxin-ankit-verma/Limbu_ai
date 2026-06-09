import { redirect } from "next/navigation";

export default function OnboardingPage() {
  redirect("/organizations/new");
}
