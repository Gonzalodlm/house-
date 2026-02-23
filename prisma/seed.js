"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// prisma/seed.ts
var import_client = require("@prisma/client");
var bcrypt = __toESM(require("bcryptjs"));
var prisma = new import_client.PrismaClient({});
async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.contractExtraction.deleteMany();
  await prisma.document.deleteMany();
  await prisma.depositLedger.deleteMany();
  await prisma.guarantee.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  const org = await prisma.organization.create({
    data: { name: "Demo Org House" }
  });
  const passwordHash = await bcrypt.hash("adminpassword", 10);
  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "Admin Principal",
      email: "admin@proyectohouse.com",
      passwordHash,
      role: "ADMIN"
    }
  });
  const property = await prisma.property.create({
    data: {
      orgId: org.id,
      name: "Edificio Bulevar",
      address: "Bulevar Artigas 1234",
      city: "Montevideo",
      notes: "Edificio en muy buen estado general"
    }
  });
  const unit = await prisma.unit.create({
    data: {
      orgId: org.id,
      propertyId: property.id,
      unitLabel: "Apt 302"
    }
  });
  const tenant = await prisma.tenant.create({
    data: {
      orgId: org.id,
      fullName: "Mar\xEDa Clara Rodr\xEDguez",
      documentId: "4.567.890-1",
      email: "maria@example.com",
      phone: "099 123 456"
    }
  });
  const lease = await prisma.lease.create({
    data: {
      orgId: org.id,
      unitId: unit.id,
      tenantId: tenant.id,
      startDate: /* @__PURE__ */ new Date("2024-11-01"),
      endDate: /* @__PURE__ */ new Date("2025-10-31"),
      currency: "UYU",
      rentAmount: 25e3,
      dueDayOfMonth: 10,
      status: "ACTIVE"
    }
  });
  await prisma.guarantee.create({
    data: {
      orgId: org.id,
      leaseId: lease.id,
      type: "ANDA",
      providerName: "Asociaci\xF3n Nacional de Afiliados",
      amountUYU: 25e3,
      status: "ACTIVE",
      startDate: /* @__PURE__ */ new Date("2024-11-01"),
      endDate: /* @__PURE__ */ new Date("2025-10-31")
    }
  });
  console.log("Seeded successfully with Demo Org, Admin, Property, Tenant and Lease.");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
