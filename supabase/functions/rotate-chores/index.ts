import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Get all houses
    const { data: houses, error: hErr } = await supabase
      .from("houses")
      .select("id");
    if (hErr) throw hErr;

    let totalCreated = 0;

    for (const house of houses ?? []) {
      // Get active chores for this house
      const { data: chores } = await supabase
        .from("chores")
        .select("*")
        .eq("house_id", house.id)
        .eq("archived", false);

      // Get house members
      const { data: members } = await supabase
        .from("house_members")
        .select("user_id")
        .eq("house_id", house.id);

      if (!chores?.length || !members?.length) continue;

      const memberIds = members.map((m: any) => m.user_id);
      const today = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (const chore of chores) {
        // Determine which dates in the next 7 days this chore is due
        const dueDates: string[] = [];

        for (let d = 0; d < 7; d++) {
          const date = new Date(today);
          date.setDate(today.getDate() + d);
          const dayName = dayNames[date.getDay()];

          const choreDays = (chore.days as string[]) || [];

          // If chore has specific days, check if this day matches
          if (choreDays.length > 0) {
            if (choreDays.includes(dayName)) {
              dueDates.push(date.toISOString().split("T")[0]);
            }
          } else if (chore.frequency === "daily") {
            dueDates.push(date.toISOString().split("T")[0]);
          } else if (chore.frequency === "weekly" && d === 0) {
            // Weekly chores with no specific days: assign for today only
            dueDates.push(date.toISOString().split("T")[0]);
          }
        }

        if (!dueDates.length) continue;

        // Get the last assignment for this chore to determine rotation offset
        const { data: lastAssignment } = await supabase
          .from("chore_assignments")
          .select("user_id")
          .eq("chore_id", chore.id)
          .order("due_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Find the starting rotation index
        let rotationIdx = 0;
        if (lastAssignment && chore.auto_rotate) {
          const lastIdx = memberIds.indexOf(lastAssignment.user_id);
          rotationIdx = lastIdx >= 0 ? lastIdx + 1 : 0;
        }

        for (const dueDate of dueDates) {
          // Check if assignments already exist for this chore + date
          const { data: existing } = await supabase
            .from("chore_assignments")
            .select("id")
            .eq("chore_id", chore.id)
            .eq("due_date", dueDate);

          if (existing && existing.length > 0) continue;

          // Create assignments for `people_needed` members
          const assignments = [];
          for (let p = 0; p < Math.min(chore.people_needed, memberIds.length); p++) {
            const userId = memberIds[(rotationIdx + p) % memberIds.length];
            assignments.push({
              chore_id: chore.id,
              user_id: userId,
              due_date: dueDate,
              status: "upcoming",
            });
          }

          if (assignments.length) {
            const { error: insertErr } = await supabase
              .from("chore_assignments")
              .insert(assignments);
            if (insertErr) {
              console.error(`Failed to insert assignments for chore ${chore.id}:`, insertErr);
            } else {
              totalCreated += assignments.length;
            }
          }

          // Advance rotation for the next due date
          rotationIdx += chore.people_needed;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, assignments_created: totalCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rotation error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
