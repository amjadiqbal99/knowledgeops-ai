import { Role } from "@prisma/client";

export function isAdmin(role?: Role) {
  return role === "ADMIN";
}

export function isReviewer(role?: Role) {
  return role === "ADMIN" || role === "REVIEWER";
}
