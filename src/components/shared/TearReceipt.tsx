// TearReceipt.tsx
import ReceiptPrinter, { type ReceiptItem } from '@/components/kokonut/TearReceipt'
import type { Order } from '@/types'

export interface SharedTearReceiptProps {
  order?: Order
  merchant?: string
  orderNumber?: string
  date?: string
  items?: ReceiptItem[]
  tax?: number
  currency?: string
  autoPrint?: boolean
  onPrint?: () => void
  onTear?: () => void
  className?: string
}

export default function TearReceipt({
  order,
  merchant = 'KisanSetu Mandi Direct',
  orderNumber,
  date,
  items,
  tax,
  currency = '₹',
  autoPrint = false,
  onPrint,
  onTear,
  className,
}: SharedTearReceiptProps) {
  // Map Order entity if passed
  const resolvedItems: ReceiptItem[] =
    items ??
    (order
      ? order.items.map((i) => ({
          name: `${i.cropName} (${i.qualityGrade})`,
          quantity: i.quantity,
          price: i.unitPrice,
        }))
      : [
          { name: 'Nashik Red Onion (Grade A)', quantity: 200, price: 30 },
          { name: 'Kolar Hybrid Tomato (Grade A)', quantity: 150, price: 27 },
          { name: 'Sona Masoori Rice (1 Qtl)', quantity: 2, price: 3350 },
        ])

  const resolvedOrderNumber = orderNumber ?? order?.orderNumber ?? 'ORD-2026-8804'
  const resolvedDate = date ?? (order ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '20 Oct 2026 · 11:30 AM')
  const resolvedTax = tax ?? 0.05

  return (
    <div className="flex flex-col items-center">
      <ReceiptPrinter
        merchant={merchant}
        order={resolvedOrderNumber}
        date={resolvedDate}
        items={resolvedItems}
        tax={resolvedTax}
        currency={currency}
        autoPrint={autoPrint}
        onPrint={onPrint}
        onTear={onTear}
        className={className}
      />
    </div>
  )
}
