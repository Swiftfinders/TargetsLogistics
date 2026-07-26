import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const SEED_PASSWORD = "seed-password-change-me";

async function main() {
  const passwordHash = await argon2.hash(SEED_PASSWORD, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email: "admin@targetslogistics.test" },
    update: {},
    create: {
      email: "admin@targetslogistics.test",
      name: "Dana Kowalski",
      passwordHash,
      userType: "STAFF",
      status: "ACTIVE",
    },
  });
  await prisma.user.upsert({
    where: { email: "csr@targetslogistics.test" },
    update: {},
    create: {
      email: "csr@targetslogistics.test",
      name: "Priya Shah",
      passwordHash,
      userType: "STAFF",
      status: "ACTIVE",
    },
  });

  const acmeAccount = await prisma.account.upsert({
    where: { id: "seed-account-acme" },
    update: {},
    create: { id: "seed-account-acme", name: "Acme Manufacturing" },
  });
  const acmeUser = await prisma.user.upsert({
    where: { email: "ops@acme.test" },
    update: {},
    create: {
      email: "ops@acme.test",
      name: "Jordan Reyes",
      passwordHash,
      userType: "CLIENT",
      status: "ACTIVE",
      accountId: acmeAccount.id,
    },
  });

  const northfieldAccount = await prisma.account.upsert({
    where: { id: "seed-account-northfield" },
    update: {},
    create: { id: "seed-account-northfield", name: "Northfield Legal" },
  });
  const northfieldUser = await prisma.user.upsert({
    where: { email: "office@northfieldlegal.test" },
    update: {},
    create: {
      email: "office@northfieldlegal.test",
      name: "Casey Nguyen",
      passwordHash,
      userType: "CLIENT",
      status: "ACTIVE",
      accountId: northfieldAccount.id,
    },
  });

  const existingRequests = await prisma.shipmentRequest.count();
  if (existingRequests === 0) {
    await prisma.shipmentRequest.createMany({
      data: [
        {
          accountId: acmeAccount.id,
          createdByUserId: acmeUser.id,
          pickupAddress: "45 Victoria St N, Kitchener, ON",
          dropoffAddress: "890 Fountain St, Cambridge, ON",
          description: "One pallet of replacement gearbox parts",
          neededBy: new Date(Date.now() + 1000 * 60 * 60 * 6),
          serviceTier: "RUSH",
          pieces: 4,
          weightKg: 62.5,
          status: "NEW",
        },
        {
          accountId: acmeAccount.id,
          createdByUserId: acmeUser.id,
          pickupAddress: "45 Victoria St N, Kitchener, ON",
          dropoffAddress: "120 Northfield Dr, Waterloo, ON",
          description: "Signed supplier agreement, needs to arrive same day",
          neededBy: new Date(Date.now() + 1000 * 60 * 60 * 24),
          serviceTier: "SAME_DAY",
          pieces: 1,
          status: "ACKNOWLEDGED",
        },
        {
          accountId: northfieldAccount.id,
          createdByUserId: northfieldUser.id,
          pickupAddress: "10 King St S, Waterloo, ON",
          dropoffAddress: "200 Ainslie St S, Cambridge, ON",
          description: "Closing documents for tomorrow morning's meeting",
          neededBy: new Date(Date.now() + 1000 * 60 * 60 * 18),
          serviceTier: "OVERNIGHT",
          pieces: 1,
          status: "CLOSED",
        },
      ],
    });
  }

  console.log("Seed complete. Staff/client login password for all seeded users:", SEED_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
