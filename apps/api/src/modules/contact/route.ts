import type { FastifyInstance } from "fastify";
import { contactSubmissionInputSchema, LOAD_SIZE_DETAILS, type LoadSize, type ContactSubmissionResponse } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { sendContactNotification } from "../../lib/email.js";

export async function contactRoutes(app: FastifyInstance) {
  app.post("/contact", async (request, reply) => {
    const parsed = contactSubmissionInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        company: parsed.data.company ?? null,
        loadSize: parsed.data.loadSize,
        message: parsed.data.message,
      },
    });

    const loadDetails = LOAD_SIZE_DETAILS[parsed.data.loadSize as LoadSize];
    void sendContactNotification({
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      company: submission.company,
      loadSize: `${loadDetails.label} — ${loadDetails.vehicle} · ${loadDetails.weightLimit}`,
      message: submission.message,
    });

    const body: ContactSubmissionResponse = {
      id: submission.id,
      receivedAt: submission.createdAt.toISOString(),
    };

    return reply.code(201).send(body);
  });
}
