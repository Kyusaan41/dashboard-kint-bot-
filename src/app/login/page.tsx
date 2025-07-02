'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  useEffect(() => {
    signIn("discord", { callbackUrl: "/dashboard" });
  }, []);

  return <p>Redirection vers Discord...</p>;
}
