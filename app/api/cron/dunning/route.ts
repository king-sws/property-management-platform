// app/api/cron/dunning/route.ts
import { NextResponse } from "next/server";
import { runDunningSequence } from "@/actions/dunning";

/**
 * Called once daily by Vercel Cron (or any external scheduler).
 * Secured with a secret token — set CRON_SECRET in your environment variables.
 *
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/dunning", "schedule": "0 9 * * *" }]
 * }
 *
 * The cron fires at 09:00 UTC every day.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Reject if secret is not configured or doesn't match
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { processed, errors } = await runDunningSequence();

    console.log(`Dunning cron completed: ${processed} processed, ${errors} errors`);

    return NextResponse.json({
      success: true,
      processed,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dunning cron error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}