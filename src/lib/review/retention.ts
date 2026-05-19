export function getReviewExpiresAt() {
  const retentionDays = Number(process.env.REVIEW_RETENTION_DAYS || 30);

  const safeRetentionDays =
    Number.isFinite(retentionDays) && retentionDays > 0 ? retentionDays : 30;

  return new Date(Date.now() + safeRetentionDays * 24 * 60 * 60 * 1000);
}

export function isReviewExpired(expiresAt: Date | null) {
  if (!expiresAt) {
    return false;
  }

  return expiresAt.getTime() <= Date.now();
}
