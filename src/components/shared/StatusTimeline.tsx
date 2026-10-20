// StatusTimeline.tsx
import CurrencyTransfer, {
  type TransferAccount,
  type TransferStatus,
  type TransferStep,
} from '@/components/kokonut/currency-transfer'

export interface StatusTimelineProps {
  status?: TransferStatus
  from?: TransferAccount
  to?: TransferAccount
  amount?: number
  farmerName?: string
  buyerName?: string
  txnId?: string
  timestamp?: string
  steps?: TransferStep[]
  rateText?: string
  onRetry?: () => void
  className?: string
}

export default function StatusTimeline({
  status,
  from,
  to,
  amount = 23700,
  farmerName = 'Ramesh Patil (Farmer)',
  buyerName = 'Southern Bulk Traders (Escrow)',
  txnId = 'TXN-KS-2026-8803',
  timestamp = '10:45 AM, Today',
  steps,
  rateText,
  onRetry,
  className,
}: StatusTimelineProps) {
  const resolvedFrom: TransferAccount = from ?? {
    amount,
    currency: 'INR',
    symbol: '₹',
    bank: buyerName,
    last4: '8803',
  }

  const resolvedTo: TransferAccount = to ?? {
    amount,
    currency: 'INR',
    symbol: '₹',
    bank: 'State Bank of India',
    last4: '4589',
    name: farmerName,
  }

  const defaultAgriSteps: TransferStep[] = [
    {
      id: 'harvest',
      title: 'Harvest Received at Central Store',
      detail: 'Verified batch from Farmer Ramesh Patil (Nashik)',
    },
    {
      id: 'qc',
      title: 'Grade A QC Inspection Cleared',
      detail: 'Moisture, sizing, and organoleptic assay confirmed',
    },
    {
      id: 'escrow',
      title: 'Direct UPI Settlement Triggered',
      detail: 'To State Bank of India ••4589 with 0% commission',
    },
    {
      id: 'settled',
      title: 'Payout Deposited in Farmer Account',
      detail: 'Instant NEFT/IMPS credit confirmed',
    },
  ]

  return (
    <div className="flex flex-col items-center">
      <CurrencyTransfer
        from={resolvedFrom}
        to={resolvedTo}
        rate={1}
        rateText={rateText ?? 'Direct Payout: ₹ (0% Intermediary Cuts)'}
        txnId={txnId}
        timestamp={timestamp}
        status={status}
        steps={steps ?? defaultAgriSteps}
        locale="en-IN"
        onRetry={onRetry}
        className={className}
      />
    </div>
  )
}
