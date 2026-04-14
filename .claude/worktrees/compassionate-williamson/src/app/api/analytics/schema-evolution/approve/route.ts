export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";

/**
 * POST /api/analytics/schema-evolution/approve
 *
 * Approves or rejects a schema candidate.
 * When approved, the candidate dimension becomes part of the active controlled
 * vocabulary used by GPT system prompts for brand profiling and consumer translation.
 *
 * Body: { candidate_id: string, action: "approve" | "reject" }
 */
export async function POST(req: NextRequest) {
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  try {
    const body = await req.json();
    const { candidate_id, action } = body as { candidate_id?: string; action?: string };

    if (!candidate_id || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Required: candidate_id (uuid) and action ('approve' | 'reject')" },
        { status: 400 }
      );
    }

    // Fetch the candidate
    const { data: candidate, error: fetchError } = await supabase
      .from("schema_candidates")
      .select("*")
      .eq("id", candidate_id)
      .single();

    if (fetchError || !candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (candidate.status !== "candidate") {
      return NextResponse.json(
        { error: `Candidate already ${candidate.status}` },
        { status: 409 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error: updateError } = await supabase
      .from("schema_candidates")
      .update({
        status: newStatus,
        approved_at: action === "approve" ? new Date().toISOString() : null,
        last_updated: new Date().toISOString(),
      })
      .eq("id", candidate_id);

    if (updateError) throw updateError;

    // Build the response with the updated controlled vocabulary if approved
    let updatedVocabulary = null;

    if (action === "approve") {
      // Fetch all approved candidates grouped by type to show the new full vocabulary
      const { data: approved } = await supabase
        .from("schema_candidates")
        .select("candidate_name, candidate_type, definition")
        .eq("status", "approved")
        .order("candidate_type");

      const approvedByType: Record<string, Array<{ name: string; definition: string }>> = {};
      for (const a of approved ?? []) {
        const type = a.candidate_type;
        if (!approvedByType[type]) approvedByType[type] = [];
        approvedByType[type].push({
          name: a.candidate_name,
          definition: a.definition,
        });
      }

      updatedVocabulary = approvedByType;
    }

    return NextResponse.json({
      success: true,
      candidate_id,
      candidate_name: candidate.candidate_name,
      candidate_type: candidate.candidate_type,
      new_status: newStatus,
      updated_vocabulary: updatedVocabulary,
      message:
        action === "approve"
          ? `"${candidate.candidate_name}" approved and added to ${candidate.candidate_type} vocabulary. GPT prompts will include this dimension in future brand profiling and consumer translation.`
          : `"${candidate.candidate_name}" rejected and will not be added to the vocabulary.`,
    });
  } catch (err) {
    console.error("[schema-evolution/approve]", err);
    return NextResponse.json(
      { error: "Failed to update candidate status" },
      { status: 500 }
    );
  }
}
