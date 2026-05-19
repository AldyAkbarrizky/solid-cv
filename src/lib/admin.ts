import { getCurrentUser } from "@/lib/session";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getCurrentAdminUser() {
  const user = await getCurrentUser();

  if (!user?.email) {
    return null;
  }

  const adminEmails = getAdminEmails();

  if (adminEmails.includes(user.email.toLowerCase())) {
    return user;
  }

  return null;
}

export async function isCurrentUserAdmin() {
  const admin = await getCurrentAdminUser();
  return Boolean(admin);
}
