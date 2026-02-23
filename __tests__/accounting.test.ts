import {
    generateMonthlyCharges,
    allocatePayment,
    calculateArrearsStatus,
    calculateNetProfit,
    Lease,
    Charge,
    Allocation,
    Expense
} from '../lib/accounting'

describe('Accounting Logic (Deterministic)', () => {
    it('generateMonthlyCharges: should generate charges idempotently', () => {
        const leases: Lease[] = [
            { id: 'lease1', status: 'ACTIVE', rentAmount: 25000, dueDayOfMonth: 5 },
            { id: 'lease2', status: 'DRAFT', rentAmount: 20000, dueDayOfMonth: 10 }
        ]

        const existingCharges: Charge[] = [
            { id: 'c1', leaseId: 'lease1', periodYYYYMM: '202510', type: 'RENT', amountUYU: 25000, dueDate: new Date() }
        ]

        // Generating for 202511 -> should create 1 charge for lease1
        const newCharges1 = generateMonthlyCharges(leases, existingCharges, '202511', { year: 2025, month: 11 })
        expect(newCharges1.length).toBe(1)
        expect(newCharges1[0].leaseId).toBe('lease1')
        expect(newCharges1[0].periodYYYYMM).toBe('202511')

        // Generating again for 202510 -> should create 0 charges (idempotent)
        const newCharges2 = generateMonthlyCharges(leases, existingCharges, '202510', { year: 2025, month: 10 })
        expect(newCharges2.length).toBe(0)
    })

    it('allocatePayment: should allocate payment to oldest first', () => {
        const unpaidCharges = [
            { id: 'c1', amountUYU: 10000, alreadyAllocated: 5000, dueDate: new Date('2025-01-05') }, // Owes 5000
            { id: 'c2', amountUYU: 10000, alreadyAllocated: 0, dueDate: new Date('2025-02-05') }    // Owes 10000
        ]

        const paymentAmount = 12000

        const allocations = allocatePayment(paymentAmount, unpaidCharges)
        // Should allocate 5000 to c1, 7000 to c2
        expect(allocations.length).toBe(2)

        const a1 = allocations.find(a => a.chargeId === 'c1')
        expect(a1?.amountAllocatedUYU).toBe(5000)

        const a2 = allocations.find(a => a.chargeId === 'c2')
        expect(a2?.amountAllocatedUYU).toBe(7000)
    })

    it('calculateArrearsStatus: calculates morosidad correctly', () => {
        const charges: Charge[] = [
            { id: 'c1', leaseId: 'L1', amountUYU: 20000, periodYYYYMM: '202501', type: 'RENT', dueDate: new Date('2025-01-05') },
            { id: 'c2', leaseId: 'L1', amountUYU: 20000, periodYYYYMM: '202502', type: 'RENT', dueDate: new Date('2025-02-05') }
        ]

        const allocations: Allocation[] = [
            { chargeId: 'c1', amountAllocatedUYU: 20000 },
            { chargeId: 'c2', amountAllocatedUYU: 5000 }
        ]

        // If today is 2025-02-10, c2 is due date passed, has 15000 debt
        const today = new Date('2025-02-10')
        const { isArrears, totalOverdue } = calculateArrearsStatus(charges, allocations, today)

        expect(isArrears).toBe(true)
        expect(totalOverdue).toBe(15000)

        // If today is 2025-02-01, c2 is not yet due
        const pastToday = new Date('2025-02-01')
        const status2 = calculateArrearsStatus(charges, allocations, pastToday)
        expect(status2.isArrears).toBe(false)
        expect(status2.totalOverdue).toBe(0)
    })

    it('calculateNetProfit: calculates correct net profit', () => {
        const rentAllocations: Allocation[] = [
            { chargeId: 'c1', amountAllocatedUYU: 50000 },
            { chargeId: 'c2', amountAllocatedUYU: 25000 }
        ] // Total income 75000

        const expenses: Expense[] = [
            { amountUYU: 10000 },
            { amountUYU: 5000 }
        ] // Total expenses 15000

        expect(calculateNetProfit(rentAllocations, expenses)).toBe(60000)
    })
})
