import { Inter } from "next/font/google";
import "@/styles/marketing.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
