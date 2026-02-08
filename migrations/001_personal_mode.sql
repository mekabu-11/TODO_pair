-- Migration: Enable Personal Mode (Allow tasks without couple_id)
-- Run this in Supabase SQL Editor

-- Step 1: Make couple_id nullable in tasks table
ALTER TABLE tasks ALTER COLUMN couple_id DROP NOT NULL;

-- Step 2: Add created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE tasks ADD COLUMN created_by UUID REFERENCES auth.users(id);
    
    -- Set created_by for existing tasks based on assignee_id or first user in couple
    UPDATE tasks SET created_by = assignee_id WHERE created_by IS NULL AND assignee_id IS NOT NULL;
    
    -- For tasks without assignee, try to use the couple's first user
    UPDATE tasks t
    SET created_by = (
      SELECT p.id 
      FROM profiles p 
      WHERE p.couple_id = t.couple_id 
      LIMIT 1
    )
    WHERE created_by IS NULL AND couple_id IS NOT NULL;
  END IF;
END $$;

-- Step 3: Set default for created_by
ALTER TABLE tasks ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Step 4: Update RLS policies to support personal tasks

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their couple's tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks for their couple" ON tasks;
DROP POLICY IF EXISTS "Users can update their couple's tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their couple's tasks" ON tasks;

-- Create new SELECT policy that allows:
-- 1. Tasks with matching couple_id (shared tasks)
-- 2. Tasks with NULL couple_id created by the user (personal tasks)
CREATE POLICY "Users can view their couple's tasks or personal tasks" ON tasks
FOR SELECT USING (
  couple_id IN (
    SELECT couple_id FROM profiles WHERE id = auth.uid()
  )
  OR (couple_id IS NULL AND created_by = auth.uid())
);

-- Create new INSERT policy
CREATE POLICY "Users can insert tasks for their couple or personal" ON tasks
FOR INSERT WITH CHECK (
  couple_id IN (
    SELECT couple_id FROM profiles WHERE id = auth.uid()
  )
  OR (couple_id IS NULL AND created_by = auth.uid())
);

-- Create new UPDATE policy
CREATE POLICY "Users can update their couple's tasks or personal" ON tasks
FOR UPDATE USING (
  couple_id IN (
    SELECT couple_id FROM profiles WHERE id = auth.uid()
  )
  OR (couple_id IS NULL AND created_by = auth.uid())
)
WITH CHECK (
  couple_id IN (
    SELECT couple_id FROM profiles WHERE id = auth.uid()
  )
  OR (couple_id IS NULL AND created_by = auth.uid())
);

-- Create new DELETE policy
CREATE POLICY "Users can delete their couple's tasks or personal" ON tasks
FOR DELETE USING (
  couple_id IN (
    SELECT couple_id FROM profiles WHERE id = auth.uid()
  )
  OR (couple_id IS NULL AND created_by = auth.uid())
);
