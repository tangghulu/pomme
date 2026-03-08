-- Remove the direct INSERT policy on house_members since all joining
-- must go through the join_house_by_code SECURITY DEFINER function.
-- The create_house_with_admin function handles admin insertion.
DROP POLICY IF EXISTS "Users can join as member" ON public.house_members;