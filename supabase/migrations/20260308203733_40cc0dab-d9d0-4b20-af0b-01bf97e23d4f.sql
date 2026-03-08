
-- Drop all restrictive policies and recreate as permissive

-- houses
DROP POLICY IF EXISTS "Members can read house" ON public.houses;
DROP POLICY IF EXISTS "Members can update house" ON public.houses;
DROP POLICY IF EXISTS "Users can create houses" ON public.houses;

CREATE POLICY "Members can read house" ON public.houses FOR SELECT USING (is_house_member(auth.uid(), id));
CREATE POLICY "Members can update house" ON public.houses FOR UPDATE USING (is_house_member(auth.uid(), id));
CREATE POLICY "Users can create houses" ON public.houses FOR INSERT WITH CHECK (created_by = auth.uid());

-- profiles
DROP POLICY IF EXISTS "Housemates can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Housemates can read profiles" ON public.profiles FOR SELECT USING (id IN (SELECT user_id FROM house_members WHERE house_id = get_user_house_id(auth.uid())));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- house_members
DROP POLICY IF EXISTS "Members can read members" ON public.house_members;
DROP POLICY IF EXISTS "Users can join" ON public.house_members;
DROP POLICY IF EXISTS "Users can leave" ON public.house_members;

CREATE POLICY "Members can read members" ON public.house_members FOR SELECT USING (is_house_member(auth.uid(), house_id));
CREATE POLICY "Users can join" ON public.house_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave" ON public.house_members FOR DELETE USING (user_id = auth.uid());

-- invite_codes
DROP POLICY IF EXISTS "Anyone can lookup active codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Members can create codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Members can read codes" ON public.invite_codes;

CREATE POLICY "Anyone can lookup active codes" ON public.invite_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Members can create codes" ON public.invite_codes FOR INSERT WITH CHECK (is_house_member(auth.uid(), house_id));
CREATE POLICY "Members can read codes" ON public.invite_codes FOR SELECT USING (is_house_member(auth.uid(), house_id));

-- chores
DROP POLICY IF EXISTS "Members can create chores" ON public.chores;
DROP POLICY IF EXISTS "Members can read chores" ON public.chores;
DROP POLICY IF EXISTS "Members can update chores" ON public.chores;

CREATE POLICY "Members can create chores" ON public.chores FOR INSERT WITH CHECK (is_house_member(auth.uid(), house_id));
CREATE POLICY "Members can read chores" ON public.chores FOR SELECT USING (is_house_member(auth.uid(), house_id));
CREATE POLICY "Members can update chores" ON public.chores FOR UPDATE USING (is_house_member(auth.uid(), house_id));

-- chore_assignments
DROP POLICY IF EXISTS "Members can create assignments" ON public.chore_assignments;
DROP POLICY IF EXISTS "Members can read assignments" ON public.chore_assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.chore_assignments;

CREATE POLICY "Members can create assignments" ON public.chore_assignments FOR INSERT WITH CHECK (chore_id IN (SELECT id FROM chores WHERE is_house_member(auth.uid(), house_id)));
CREATE POLICY "Members can read assignments" ON public.chore_assignments FOR SELECT USING (chore_id IN (SELECT id FROM chores WHERE is_house_member(auth.uid(), house_id)));
CREATE POLICY "Users can update own assignments" ON public.chore_assignments FOR UPDATE USING (user_id = auth.uid());
