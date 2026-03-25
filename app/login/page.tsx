import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth";
import { systemModules } from "@/lib/constants";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
      <div className="hidden border-r bg-primary px-12 py-16 text-primary-foreground lg:flex lg:flex-col">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/70">Claude Ops OS</p>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight">
            Internal operating system for source-grounded execution.
          </h1>
          <p className="mt-6 max-w-xl text-base text-primary-foreground/80">
            Organize fragmented SOPs, strategy, and training into a single authority model that powers explainable workflows.
          </p>
        </div>
        <div className="mt-14 grid gap-4">
          {systemModules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-medium">{module.title}</h2>
                <p className="mt-1 text-sm text-primary-foreground/75">{module.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seeded demo accounts are provided for Admin, Team Member, and Reviewer roles.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
