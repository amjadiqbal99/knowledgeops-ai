import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return session;
}
