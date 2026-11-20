import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Add a short subject").max(120),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(4000),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const { sendContactEmails } = await import("./contact.server");
    const { PROFILE } = await import("./profile");
    return sendContactEmails(
      {
        name: data.name,
        email: data.email,
        ...(data.phone ? { phone: data.phone } : {}),
        subject: data.subject,
        message: data.message,
      },
      PROFILE.email,
    );
  });
