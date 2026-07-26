import type { FastifyInstance } from "fastify";
import { contactSubmissionInputSchema, type ContactSubmissionResponse } from "@targets/shared";
import { prisma } from "../../lib/db.js";

export async function contactRoutes(app: FastifyInstance) {
  app.post("/contact", async (request, reply) => {
    const parsed = contactSubmissionInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        ...parsed.data,
        phone: parsed.data.phone ?? null,
        company: parsed.data.company ?? null,
      },
    });

    const body: ContactSubmissionResponse = {
      id: submission.id,
      receivedAt: submission.createdAt.toISOString(),
    };

    return reply.code(201).send(body);
  });
}
