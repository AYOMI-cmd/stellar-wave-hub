import { projectsCol, ratingsCol } from "@/lib/db";

/**
 * XP Calculation Rules:
 * - Approved project (created by user, status = "approved" or "featured"): +50
 * - Review (rating with review_text): +10
 * - On-chain review (rating with tx_hash): +15
 * - Helpful votes: +2 (placeholder - no current mechanism)
 */

export interface XpBreakdown {
  approvedProjects: number;
  reviews: number;
  onChainReviews: number;
  helpfulVotes: number;
  total: number;
}

export async function computeXp(userId: number): Promise<XpBreakdown> {
  // Get all projects created by this user that are approved or featured
  const projectsSnap = await projectsCol.ref
    .where("user_id", "==", userId)
    .where("status", "in", ["approved", "featured"])
    .get();

  const approvedProjectsCount = projectsSnap.size;
  const approvedProjectsXp = approvedProjectsCount * 50;

  // Get all ratings by this user
  const ratingsSnap = await ratingsCol.ref
    .where("user_id", "==", userId)
    .get();

  let reviewsCount = 0;
  let onChainReviewsCount = 0;

  for (const doc of ratingsSnap.docs) {
    const rating = doc.data();
    // Review: has review_text (non-empty string)
    if (rating.review_text && typeof rating.review_text === "string" && rating.review_text.trim().length > 0) {
      reviewsCount++;
    }
    // On-chain review: has tx_hash (non-empty string)
    if (rating.tx_hash && typeof rating.tx_hash === "string" && rating.tx_hash.trim().length > 0) {
      onChainReviewsCount++;
    }
  }

  const reviewsXp = reviewsCount * 10;
  const onChainReviewsXp = onChainReviewsCount * 15;

  // Helpful votes: placeholder (no current mechanism in the codebase)
  // Future: could be a separate collection tracking helpful votes on reviews
  const helpfulVotesCount = 0;
  const helpfulVotesXp = helpfulVotesCount * 2;

  const total = approvedProjectsXp + reviewsXp + onChainReviewsXp + helpfulVotesXp;

  return {
    approvedProjects: approvedProjectsXp,
    reviews: reviewsXp,
    onChainReviews: onChainReviewsXp,
    helpfulVotes: helpfulVotesXp,
    total,
  };
}