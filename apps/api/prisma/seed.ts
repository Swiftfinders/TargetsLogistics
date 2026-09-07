import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const SEED_PASSWORD = "seed-password-change-me";

async function main() {
  const passwordHash = await argon2.hash(SEED_PASSWORD, { type: argon2.argon2id });

  // Production staff account — always upsert so re-running seed resets the password
  const staffPassword = process.env.STAFF_PASSWORD || "@targetslogistics";
  const staffPasswordHash = await argon2.hash(staffPassword, { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email: "kr2011@live.ca" },
    update: { passwordHash: staffPasswordHash },
    create: {
      email: "kr2011@live.ca",
      name: "Admin",
      passwordHash: staffPasswordHash,
      userType: "STAFF",
      status: "ACTIVE",
    },
  });

  // Dev/test staff accounts
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

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    await prisma.order.createMany({
      data: [
        {
          reference: "TL-100001-001",
          accountId: acmeAccount.id,
          createdByUserId: acmeUser.id,
          pickupCompany: "Acme Manufacturing",
          pickupAddress: "45 Victoria St N, Kitchener, ON",
          deliveryAddress: "890 Fountain St, Cambridge, ON",
          packageType: "PALLET",
          pieces: 4,
          weightKg: 62.5,
          contents: "Replacement gearbox parts",
          vehicleType: "CARGO_VAN",
          serviceLevel: "FOUR_HOURS",
          estimatedPriceCents: 14000,
          status: "NEW",
        },
        {
          reference: "TL-100002-002",
          accountId: acmeAccount.id,
          createdByUserId: acmeUser.id,
          pickupCompany: "Acme Manufacturing",
          pickupAddress: "45 Victoria St N, Kitchener, ON",
          deliveryAddress: "120 Northfield Dr, Waterloo, ON",
          packageType: "ENVELOPE",
          pieces: 1,
          contents: "Signed supplier agreement",
          vehicleType: "CAR",
          serviceLevel: "SAME_DAY",
          estimatedPriceCents: 2500,
          status: "ACKNOWLEDGED",
        },
        {
          reference: "TL-100003-003",
          accountId: northfieldAccount.id,
          createdByUserId: northfieldUser.id,
          pickupCompany: "Northfield Legal",
          pickupAddress: "10 King St S, Waterloo, ON",
          deliveryAddress: "200 Ainslie St S, Cambridge, ON",
          packageType: "ENVELOPE",
          pieces: 1,
          contents: "Closing documents",
          vehicleType: "CAR",
          serviceLevel: "NEXT_DAY",
          estimatedPriceCents: 2500,
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
