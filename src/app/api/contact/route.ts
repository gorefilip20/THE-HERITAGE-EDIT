import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

/* ──────────────────────────────────────────────────────────
   CONTACT FORM — stores enquiries in the database so the
   admin can review them. (No external email service required.)
   ────────────────────────────────────────────────────────── */
const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 },
    );
  }
}
