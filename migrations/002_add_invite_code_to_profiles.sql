-- Migration: Add invite_code to profiles table
-- Run this in Supabase SQL Editor

-- Step 1: Add invite_code column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Step 2: Generate invite codes for existing profiles that don't have one
UPDATE profiles
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE invite_code IS NULL;

-- Step 3: Make invite_code NOT NULL with auto-generation for new records
ALTER TABLE profiles ALTER COLUMN invite_code SET DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

-- Step 4: Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON profiles(invite_code);
