import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useHouse() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["house", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: membership } = await supabase
        .from("house_members")
        .select("house_id, role")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (!membership) return null;

      const { data: house } = await supabase
        .from("houses")
        .select("*")
        .eq("id", membership.house_id)
        .single();

      return house ? { ...house, userRole: membership.role } : null;
    },
  });
}

export function useHouseMembers() {
  const { data: house } = useHouse();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["house_members", house?.id],
    enabled: !!house,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("house_members")
        .select("*")
        .eq("house_id", house!.id);
      if (error) throw error;

      const userIds = (data || []).map((m: any) => m.user_id);
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("*").in("id", userIds)
        : { data: [] };
      const profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.id, p])
      );

      return (data || []).map((m: any) => ({
        ...m,
        profiles: profileMap[m.user_id] || null,
        isYou: m.user_id === user?.id,
      }));
    },
  });
}

export function useInviteCode() {
  const { data: house } = useHouse();
  return useQuery({
    queryKey: ["invite_code", house?.id],
    enabled: !!house,
    queryFn: async () => {
      const { data } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("house_id", house!.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
}

export function useChores() {
  const { data: house } = useHouse();
  return useQuery({
    queryKey: ["chores", house?.id],
    enabled: !!house,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*")
        .eq("house_id", house!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useChoreAssignments() {
  const { data: house } = useHouse();
  return useQuery({
    queryKey: ["chore_assignments", house?.id],
    enabled: !!house,
    queryFn: async () => {
      // Get chore IDs for this house
      const { data: houseChores } = await supabase
        .from("chores")
        .select("id")
        .eq("house_id", house!.id);
      const choreIds = houseChores?.map((c: any) => c.id) || [];
      if (!choreIds.length) return [];

      const { data, error } = await supabase
        .from("chore_assignments")
        .select("*, chores(*)")
        .in("chore_id", choreIds);
      if (error) throw error;

      // Fetch profiles for all assigned user IDs
      const userIds = [...new Set((data || []).map((a: any) => a.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("*").in("id", userIds)
        : { data: [] };

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.id, p])
      );

      return (data || []).map((a: any) => ({
        ...a,
        profile: profileMap[a.user_id] || null,
      }));
    },
  });
}
