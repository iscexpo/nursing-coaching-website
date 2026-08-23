-- 0021: Drop the legacy custom "otp" table. Password-reset and phone OTP
-- flows are consolidated on the isc-auth plugin tables (verification tokens
-- live on "verification" / phone fields), so this table is dead weight.
DROP TABLE IF EXISTS "otp";
