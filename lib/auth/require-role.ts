import { getCurrentProfile } from "@/lib/auth/session";
import { getCurrentPlatformAdmin, type PlatformAdmin } from "@/lib/auth/platform-session";
import type { Profile } from "@/types/profile";

export async function requireAdmin(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.active) return null;
  if (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN") return null;
  return profile;
}

export async function requireSuperAdmin(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.active) return null;
  if (profile.role !== "SUPER_ADMIN") return null;
  return profile;
}

export async function requirePlatformAdmin(): Promise<PlatformAdmin | null> {
  return getCurrentPlatformAdmin();
}
