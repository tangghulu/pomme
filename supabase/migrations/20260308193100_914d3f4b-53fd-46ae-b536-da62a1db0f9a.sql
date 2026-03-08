
-- Create all tables first
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT 'hsl(110, 20%, 70%)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.house_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(house_id, user_id)
);

CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📋',
  frequency TEXT NOT NULL DEFAULT 'weekly',
  days TEXT[] NOT NULL DEFAULT '{}',
  reminder_time TEXT NOT NULL DEFAULT '9:00 AM',
  people_needed INT NOT NULL DEFAULT 1,
  auto_rotate BOOLEAN NOT NULL DEFAULT true,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.chore_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID REFERENCES public.chores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_assignments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check house membership
CREATE OR REPLACE FUNCTION public.is_house_member(_user_id UUID, _house_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.house_members WHERE user_id = _user_id AND house_id = _house_id
  )
$$;

-- Get user's house_id
CREATE OR REPLACE FUNCTION public.get_user_house_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT house_id FROM public.house_members WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Housemates can read profiles" ON public.profiles FOR SELECT TO authenticated USING (
  id IN (SELECT user_id FROM public.house_members WHERE house_id = public.get_user_house_id(auth.uid()))
);

-- Houses policies
CREATE POLICY "Members can read house" ON public.houses FOR SELECT TO authenticated USING (public.is_house_member(auth.uid(), id));
CREATE POLICY "Users can create houses" ON public.houses FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Members can update house" ON public.houses FOR UPDATE TO authenticated USING (public.is_house_member(auth.uid(), id));

-- House members policies
CREATE POLICY "Members can read members" ON public.house_members FOR SELECT TO authenticated USING (public.is_house_member(auth.uid(), house_id));
CREATE POLICY "Users can join" ON public.house_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave" ON public.house_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Invite codes policies
CREATE POLICY "Members can read codes" ON public.invite_codes FOR SELECT TO authenticated USING (public.is_house_member(auth.uid(), house_id));
CREATE POLICY "Members can create codes" ON public.invite_codes FOR INSERT TO authenticated WITH CHECK (public.is_house_member(auth.uid(), house_id));
CREATE POLICY "Anyone can lookup active codes" ON public.invite_codes FOR SELECT TO authenticated USING (is_active = true);

-- Chores policies
CREATE POLICY "Members can read chores" ON public.chores FOR SELECT TO authenticated USING (public.is_house_member(auth.uid(), house_id));
CREATE POLICY "Members can create chores" ON public.chores FOR INSERT TO authenticated WITH CHECK (public.is_house_member(auth.uid(), house_id));
CREATE POLICY "Members can update chores" ON public.chores FOR UPDATE TO authenticated USING (public.is_house_member(auth.uid(), house_id));

-- Chore assignments policies
CREATE POLICY "Members can read assignments" ON public.chore_assignments FOR SELECT TO authenticated USING (
  chore_id IN (SELECT id FROM public.chores WHERE public.is_house_member(auth.uid(), house_id))
);
CREATE POLICY "Members can create assignments" ON public.chore_assignments FOR INSERT TO authenticated WITH CHECK (
  chore_id IN (SELECT id FROM public.chores WHERE public.is_house_member(auth.uid(), house_id))
);
CREATE POLICY "Users can update own assignments" ON public.chore_assignments FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate invite code function
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;
