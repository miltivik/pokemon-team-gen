import { NextRequest, NextResponse } from "next/server";

import {
  bugReportSchema,
  formatBugReportEmail,
} from "@/lib/bug-report";

async function sendBugReportEmail(reportBody: string, subject: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BUG_REPORT_TO_EMAIL;
  const from = process.env.BUG_REPORT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Bug reporting is not configured on the server.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: reportBody,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Resend request failed: ${response.status} ${response.statusText} ${responseText}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bugReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid bug report payload.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.honeypot) {
      return NextResponse.json(
        { error: "Spam protection triggered." },
        { status: 400 }
      );
    }

    const subject = `[Bug Report] ${parsed.data.title}`;
    const reportBody = formatBugReportEmail(parsed.data);

    await sendBugReportEmail(reportBody, subject);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to submit bug report:", error);

    return NextResponse.json(
      { error: "Failed to submit the bug report." },
      { status: 500 }
    );
  }
}
