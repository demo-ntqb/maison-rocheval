"use server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";

import { COUNTRY_VALUES } from "../constants/contact.constant";

const contactPayloadSchema = z.object({
  company: z.string().trim(),
  country: z.enum(COUNTRY_VALUES),
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  message: z.string().trim().min(1),
  phone: z.string().trim(),
  wholesale: z.boolean(),
});

export type ContactSubmissionResult =
  | { status: "success" }
  | { status: "error" }
  | { status: "rate-limited" };

// 3 submissions per 10 minutes per IP. Falls back to no limiting (with a
// warning) when Upstash isn't configured, so local dev works without it.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        analytics: false,
        limiter: Ratelimit.slidingWindow(3, "10 m"),
        prefix: "contact-form",
        redis: Redis.fromEnv(),
      })
    : null;

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headerList.get("x-real-ip") || "unknown";
}

export async function submitContactForm(
  values: z.infer<typeof contactPayloadSchema>,
): Promise<ContactSubmissionResult> {
  const parsed = contactPayloadSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error" };
  }

  if (ratelimit) {
    const ip = await getClientIp();
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return { status: "rate-limited" };
    }
  } else {
    console.warn(
      "[contact] UPSTASH_REDIS_REST_URL/TOKEN not configured; submissions are not rate-limited.",
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL_TO;

  if (!apiKey || !toEmail) {
    console.error(
      "[contact] RESEND_API_KEY or CONTACT_EMAIL_TO is not configured; refusing to send.",
    );
    return { status: "error" };
  }

  const { company, country, email, firstName, lastName, message, phone, wholesale } =
    parsed.data;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Maison Rocheval <onboarding@resend.dev>",
      replyTo: email,
      subject: `New contact form submission from ${firstName} ${lastName}`,
      text: [
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Country: ${country}`,
        company && `Company: ${company}`,
        phone && `Phone: ${phone}`,
        `Wholesale inquiry: ${wholesale ? "Yes" : "No"}`,
        "",
        "Message:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
      to: toEmail,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return { status: "error" };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[contact] Failed to send contact email:", err);
    return { status: "error" };
  }
}
