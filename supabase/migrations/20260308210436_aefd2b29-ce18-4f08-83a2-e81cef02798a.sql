
-- Drop the restrictive INSERT policy on houses
DROP POLICY IF EXISTS "Users can create houses" ON public.houses;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Users can create houses"
ON public.houses
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());
