-- Migration: Add soft delete support to profiles
-- Run this in Supabase SQL Editor

-- Add deleted_at column for soft delete
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);
