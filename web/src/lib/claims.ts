export const CLAIM_TTL_MINUTES = 30;

export interface ClaimableProject {
  claimedAt?: string | Date | null;
  claimedBy?: string | null;
  [key: string]: any;
}

/**
 * Helper to determine if a project's claim is active or expired.
 * A claim is active if claimedAt exists and is within CLAIM_TTL_MINUTES (default 30 min).
 */
export function isClaimActive(project: ClaimableProject, ttlMinutes: number = CLAIM_TTL_MINUTES): boolean {
  if (!project || !project.claimedAt) {
    return false;
  }

  const claimedDate = new Date(project.claimedAt).getTime();
  if (isNaN(claimedDate)) {
    return false;
  }

  const now = Date.now();
  const diffInMinutes = (now - claimedDate) / (1000 * 60);

  return diffInMinutes < ttlMinutes;
}
