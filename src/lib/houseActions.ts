import { supabase } from "@/integrations/supabase/client";

export async function createHouse(name: string, userId: string) {
  // Create house
  const { data: house, error: houseErr } = await supabase
    .from("houses")
    .insert({ name, created_by: userId })
    .select()
    .single();
  if (houseErr) throw houseErr;

  // Add creator as member
  await supabase.from("house_members").insert({
    house_id: house.id,
    user_id: userId,
    role: "admin",
  });

  // Generate invite code
  const { data: codeResult } = await supabase.rpc("generate_invite_code");
  const code = codeResult || `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  
  await supabase.from("invite_codes").insert({
    house_id: house.id,
    code,
    created_by: userId,
  });

  return { house, code };
}

export async function joinHouseByCode(code: string, userId: string) {
  const { data: invite, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!invite) throw new Error("Invalid or expired invite code");

  const { error: joinErr } = await supabase.from("house_members").insert({
    house_id: invite.house_id,
    user_id: userId,
  });

  if (joinErr) {
    if (joinErr.code === "23505") throw new Error("You're already a member of this house");
    throw joinErr;
  }

  return invite.house_id;
}

export async function createChore(params: {
  house_id: string;
  name: string;
  icon: string;
  frequency: string;
  days: string[];
  reminder_time: string;
  people_needed: number;
  auto_rotate: boolean;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from("chores")
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markAssignmentDone(assignmentId: string) {
  const { error } = await supabase
    .from("chore_assignments")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", assignmentId);
  if (error) throw error;
}

export async function updateProfile(userId: string, updates: { username?: string; avatar_color?: string }) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}

export async function updateHouseName(houseId: string, name: string) {
  const { error } = await supabase
    .from("houses")
    .update({ name })
    .eq("id", houseId);
  if (error) throw error;
}

export async function leaveHouse(houseId: string, userId: string) {
  const { error } = await supabase
    .from("house_members")
    .delete()
    .eq("house_id", houseId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateChore(choreId: string, updates: Partial<{
  name: string; icon: string; frequency: string; days: string[];
  reminder_time: string; people_needed: number; auto_rotate: boolean; archived: boolean;
}>) {
  const { error } = await supabase
    .from("chores")
    .update(updates)
    .eq("id", choreId);
  if (error) throw error;
}

export async function deleteAccount(userId: string) {
  // Leave any houses first
  await supabase.from("house_members").delete().eq("user_id", userId);
  // Delete profile
  await supabase.from("profiles").delete().eq("id", userId);
  // Sign out (actual user deletion requires admin, so we just clean up and sign out)
  await supabase.auth.signOut();
}
