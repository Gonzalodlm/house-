export type Lease = {
    id: string
    rentAmount: number
    dueDayOfMonth: number
    status: 'ACTIVE' | 'DRAFT' | 'ENDED'
}

export type Charge = {
    id: string
    leaseId: string
    periodYYYYMM: string
    amountUYU: number
    dueDate: Date
    type: 'RENT' | 'OTHER'
}

export type Allocation = {
    chargeId: string
    amountAllocatedUYU: number
}

export type Expense = {
    amountUYU: number
}

/**
 * 1) Monthly charge generation idempotency
 * Generates missing RENT charges for active leases.
 * Idempotency is achieved by checking if a 'RENT' charge already exists for `periodYYYYMM` on a lease.
 */
export function generateMonthlyCharges(
    leases: Lease[],
    existingCharges: Charge[],
    periodYYYYMM: string,
    currentYearMonth: { year: number, month: number }
): Omit<Charge, 'id'>[] {
    const newCharges: Omit<Charge, 'id'>[] = []

    for (const lease of leases) {
        if (lease.status !== 'ACTIVE') continue

        const hasCharge = existingCharges.some(
            c => c.leaseId === lease.id && c.periodYYYYMM === periodYYYYMM && c.type === 'RENT'
        )

        if (!hasCharge) {
            newCharges.push({
                leaseId: lease.id,
                periodYYYYMM,
                amountUYU: lease.rentAmount,
                dueDate: new Date(currentYearMonth.year, currentYearMonth.month - 1, lease.dueDayOfMonth), // month is 0-indexed in Date
                type: 'RENT'
            })
        }
    }

    return newCharges
}

/**
 * 2) Allocation Logic
 * Allocates payment strictly to oldest unpaid charges first.
 */
export function allocatePayment(
    paymentAmount: number,
    unpaidChargesArg: { id: string, amountUYU: number, alreadyAllocated: number, dueDate: Date }[]
): Allocation[] {
    const allocations: Allocation[] = []
    let remainingPayment = paymentAmount

    // Sort by oldest due date
    const sortedCharges = [...unpaidChargesArg].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    for (const charge of sortedCharges) {
        if (remainingPayment <= 0) break

        const unpaidDebt = charge.amountUYU - charge.alreadyAllocated
        if (unpaidDebt > 0) {
            const allocateAmt = Math.min(remainingPayment, unpaidDebt)
            allocations.push({ chargeId: charge.id, amountAllocatedUYU: allocateAmt })
            remainingPayment -= allocateAmt
        }
    }

    return allocations
}

/**
 * 3) Arrears Calculation (Morosidad)
 * True if any RENT charge with dueDate < today has unpaid amount > 0.
 */
export function calculateArrearsStatus(
    charges: { id: string, amountUYU: number, dueDate: Date, type: 'RENT' | 'OTHER' }[],
    allocations: { chargeId: string, amountAllocatedUYU: number }[],
    today: Date
): { isArrears: boolean, totalOverdue: number } {
    let isArrears = false
    let totalOverdue = 0

    for (const charge of charges) {
        if (charge.type !== 'RENT') continue

        const totalAllocated = allocations
            .filter(a => a.chargeId === charge.id)
            .reduce((acc, a) => acc + a.amountAllocatedUYU, 0)

        // Only count if due date is passed
        if (charge.dueDate < today && charge.amountUYU > totalAllocated) {
            isArrears = true
            totalOverdue += (charge.amountUYU - totalAllocated)
        }
    }

    return { isArrears, totalOverdue }
}

/**
 * 4) Profitability Logic
 * Net profit = sum of rent allocations - sum of expenses
 */
export function calculateNetProfit(
    rentAllocations: Allocation[],
    expenses: Expense[]
): number {
    const totalIncome = rentAllocations.reduce((acc, a) => acc + a.amountAllocatedUYU, 0)
    const totalExpense = expenses.reduce((acc, e) => acc + e.amountUYU, 0)

    return totalIncome - totalExpense
}
