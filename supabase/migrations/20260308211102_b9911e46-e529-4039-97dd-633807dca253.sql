
-- 1. Remove the unsafe public SELECT policy on invite_codes
DROP POLICY IF EXISTS "Anyone can lookup active codes" ON public.invite_codes;

-- 2. Create a SECURITY DEFINER function to validate and join via invite code
CREATE OR REPLACE FUNCTION public.join_house_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _house_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Look up the invite code
  SELECT house_id INTO _house_id
  FROM public.invite_codes
  WHERE code = upper(trim(_code))
    AND is_active = true;

  IF _house_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.house_members WHERE user_id = _user_id AND house_id = _house_id) THEN
    RAISE EXCEPTION 'You are already a member of this house';
  END IF;

  -- Insert as member (never admin via this path)
  INSERT INTO public.house_members (house_id, user_id, role)
  VALUES (_house_id, _user_id, 'member');

  RETURN _house_id;
END;
$$;

-- 3. Fix house_members INSERT policy to restrict role to 'member' and require valid context
DROP POLICY IF EXISTS "Users can join" ON public.house_members;

-- Only allow inserts where role is 'member' (admin assignment handled by createHouse flow)
CREATE POLICY "Users can join as member"
ON public.house_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'member');

-- 4. Create a SECURITY DEFINER function for house creation (assigns admin safely)
CREATE OR REPLACE FUNCTION public.create_house_with_admin(_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _house_id uuid;
  _code text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create house
  INSERT INTO public.houses (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _house_id;

  -- Add creator as admin
  INSERT INTO public.house_members (house_id, user_id, role)
  VALUES (_house_id, _user_id, 'admin');

  -- Generate invite code
  _code := public.generate_invite_code();
  INSERT INTO public.invite_codes (house_id, code, created_by)
  VALUES (_house_id, _code, _user_id);

  RETURN json_build_object('house_id', _house_id, 'code', _code);
END;
$$;
