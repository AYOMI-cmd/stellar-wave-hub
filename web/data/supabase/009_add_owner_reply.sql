-- Add owner reply columns to ratings

ALTER TABLE ratings
ADD COLUMN IF NOT EXISTS owner_reply text,
ADD COLUMN IF NOT EXISTS owner_reply_at timestamptz;
