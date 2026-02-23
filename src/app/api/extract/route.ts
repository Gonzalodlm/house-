import { NextResponse } from 'next/server'
// PDF Parse imported dynamically

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('contract') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Read file array buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Extract text using pdf-parse dynamically
        const pdfModule: any = await import('pdf-parse')
        const pdf = pdfModule.default || pdfModule
        const data = await pdf(buffer)
        const text = data.text

        // --- DETERMINISTIC EXTRACTION RULES ---
        let tenantName = 'Por confirmar'
        let tenantDocumentId = ''
        let startDate = ''
        let endDate = ''
        let rentAmount = null
        let currency = 'UYU'
        let dueDayOfMonth = 5
        let guaranteeType = 'OTHER'

        // Example simple heuristics for Spanish Uruguay contracts
        // You can refine these regexes based on real contract formats.

        // 1. DNI/CI
        const ciMatch = text.match(/C\.?I\.?\s?(N°|Nro)?\s?[:\.]?\s*([\d\.\-]+)/i)
        if (ciMatch) tenantDocumentId = ciMatch[2]

        // 2. Rent Amount ($ y UYU)
        const rentMatch = text.match(/\$\s?([\d\.]+)/)
        if (rentMatch) {
            rentAmount = parseInt(rentMatch[1].replace(/\./g, ''), 10)
        }

        // 3. Due Date (del 1 al 10, etc)
        const dueMatch = text.match(/del\s?(\d+)\s?al\s?(\d+)\s?de cada mes/i)
        if (dueMatch && dueMatch[2]) {
            dueDayOfMonth = parseInt(dueMatch[2], 10)
        } else {
            // Default to 5 or general fallback
            const fixedDue = text.match(/(\d+)\s?de cada mes/i)
            if (fixedDue) dueDayOfMonth = parseInt(fixedDue[1], 10)
        }

        // 4. Guarantee
        if (text.match(/ANDA/i)) guaranteeType = 'ANDA'
        else if (text.match(/Contaduría|CGN/i)) guaranteeType = 'OTHER'
        else if (text.match(/Porto|Sura|Mapfre|Seguro/i)) guaranteeType = 'INSURANCE'
        else if (text.match(/Depósito/i)) guaranteeType = 'DEPOSIT'

        // Form the proposed fields
        const proposedFields = {
            tenantName,
            tenantDocumentId,
            startDate,
            endDate,
            rentAmount,
            currency,
            dueDayOfMonth,
            guaranteeType
        }

        // Return the result
        return NextResponse.json({
            extractedText: text.substring(0, 1000) + '...', // send a snippet or all text
            proposedFields,
        })

    } catch (error: any) {
        console.error('Extraction error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
