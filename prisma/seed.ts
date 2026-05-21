/**
 * Seed data for CampusWash (Phase 1).
 * Creates parking lots, service types, and demo accounts.
 */
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Parking lots ──────────────────────────────────────────────────────────
  const parkingLots = [
    { name: "موقف كلية الهندسة", universitySection: "كلية الهندسة" },
    { name: "موقف كلية الطب", universitySection: "كلية الطب" },
    { name: "موقف كلية العلوم", universitySection: "كلية العلوم" },
    { name: "الموقف الرئيسي", universitySection: "المبنى الإداري" },
    { name: "موقف السكن الطلابي", universitySection: "السكن الطلابي" },
  ];

  for (const lot of parkingLots) {
    await prisma.parkingLot.upsert({
      where: { id: lot.name }, // deterministic id via name for idempotency
      update: {},
      create: { id: lot.name, ...lot },
    });
  }

  // ── Service types ─────────────────────────────────────────────────────────
  const services = [
    {
      id: "service-exterior",
      nameAr: "غسيل خارجي",
      nameEn: "Exterior Wash",
      price: 1.5,
      durationMinutes: 15,
      description: "غسيل خارجي سريع للسيارة",
    },
    {
      id: "service-exterior-interior",
      nameAr: "غسيل خارجي + داخلي",
      nameEn: "Exterior + Interior Wash",
      price: 3,
      durationMinutes: 30,
      description: "غسيل خارجي وتنظيف داخلي كامل",
    },
    {
      id: "service-royal",
      nameAr: "غسيل ملكي شامل",
      nameEn: "Royal Full Wash",
      price: 5,
      durationMinutes: 45,
      description: "غسيل وتلميع شامل داخلي وخارجي مع العناية الكاملة",
    },
  ];

  for (const svc of services) {
    await prisma.serviceType.upsert({
      where: { id: svc.id },
      update: { ...svc },
      create: { ...svc },
    });
  }

  // ── Demo accounts ─────────────────────────────────────────────────────────
  const demoUsers = [
    { phone: "96891234567", name: "أحمد", role: Role.STUDENT },
    { phone: "96898765432", name: "سالم", role: Role.WORKER },
    { phone: "96899999999", name: "المشرف", role: Role.ADMIN },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: { name: u.name, role: u.role },
      create: u,
    });
  }

  console.log("✅ Seed complete: 5 parking lots, 3 services, 3 demo accounts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
