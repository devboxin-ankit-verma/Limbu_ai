"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function DeveloperboxLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="m-logo">
      <motion.span
        className="m-logo-icon"
        aria-hidden
        whileHover={{ scale: 1.06, rotate: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
      >
        <Image
          src="/marketing/developerbox-logo.svg"
          alt=""
          width={40}
          height={40}
          priority
        />
      </motion.span>
      <span className="m-logo-text">
        Developer<span className="m-logo-accent">box</span>
        <span className="m-logo-ai">.ai</span>
      </span>
    </Link>
  );
}
