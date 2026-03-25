"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/features/settings/actions";
import { profileFormSchema } from "@/lib/schemas";

type ProfileValues = z.input<typeof profileFormSchema>;

export function ProfileForm({ user }: { user: Pick<User, "name" | "title" | "department" | "email"> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      title: user.title || "",
      department: user.department || "",
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          await updateProfile(values);
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Name">
          <Input {...form.register("name")} />
        </FormField>
        <FormField label="Email">
          <Input value={user.email} disabled />
        </FormField>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Title">
          <Input {...form.register("title")} />
        </FormField>
        <FormField label="Department">
          <Input {...form.register("department")} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Update profile"}
        </Button>
      </div>
    </form>
  );
}
