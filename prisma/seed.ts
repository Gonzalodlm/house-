import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient({})

async function main() {
    // Clear possible existing data (Careful in real use cases, fine for dev db)
    await prisma.auditLog.deleteMany()
    await prisma.maintenanceTicket.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.allocation.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.charge.deleteMany()
    await prisma.contractExtraction.deleteMany()
    await prisma.document.deleteMany()
    await prisma.depositLedger.deleteMany()
    await prisma.guarantee.deleteMany()
    await prisma.lease.deleteMany()
    await prisma.tenant.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.property.deleteMany()
    await prisma.user.deleteMany()
    await prisma.organization.deleteMany()

    // 1) Seed Organization
    const org = await prisma.organization.create({
        data: { name: 'Demo Org House' }
    })

    // 2) Seed Admin User
    const passwordHash = await bcrypt.hash('adminpassword', 10)
    const user = await prisma.user.create({
        data: {
            orgId: org.id,
            name: 'Admin Principal',
            email: 'admin@proyectohouse.com',
            passwordHash,
            role: 'ADMIN'
        }
    })

    // 3) Seed Property & Unit
    const property = await prisma.property.create({
        data: {
            orgId: org.id,
            name: 'Edificio Bulevar',
            address: 'Bulevar Artigas 1234',
            city: 'Montevideo',
            notes: 'Edificio en muy buen estado general'
        }
    })

    const unit = await prisma.unit.create({
        data: {
            orgId: org.id,
            propertyId: property.id,
            unitLabel: 'Apt 302'
        }
    })

    // 4) Seed Tenant
    const tenant = await prisma.tenant.create({
        data: {
            orgId: org.id,
            fullName: 'María Clara Rodríguez',
            documentId: '4.567.890-1',
            email: 'maria@example.com',
            phone: '099 123 456'
        }
    })

    // 5) Seed Lease
    const lease = await prisma.lease.create({
        data: {
            orgId: org.id,
            unitId: unit.id,
            tenantId: tenant.id,
            startDate: new Date('2024-11-01'),
            endDate: new Date('2025-10-31'),
            currency: 'UYU',
            rentAmount: 25000,
            dueDayOfMonth: 10,
            status: 'ACTIVE'
        }
    })

    // 6) Seed Guarantee
    await prisma.guarantee.create({
        data: {
            orgId: org.id,
            leaseId: lease.id,
            type: 'ANDA',
            providerName: 'Asociación Nacional de Afiliados',
            amountUYU: 25000,
            status: 'ACTIVE',
            startDate: new Date('2024-11-01'),
            endDate: new Date('2025-10-31')
        }
    })

    console.log('Seeded successfully with Demo Org, Admin, Property, Tenant and Lease.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
