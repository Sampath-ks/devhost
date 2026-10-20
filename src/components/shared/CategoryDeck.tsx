// CategoryDeck.tsx
import { useMemo } from 'react'
import CardStack, { type DeckCard } from '@/components/kokonut/card-stack'
import { CROPS } from '@/data/crops'
import type { Crop } from '@/types'

export interface CategoryDeckProps {
  crops?: Crop[]
  cards?: DeckCard[]
  accent?: string
  actionLabel?: string
  onAction?: (card: DeckCard) => void
  onChange?: (card: DeckCard) => void
  className?: string
}

export default function CategoryDeck({
  crops,
  cards,
  accent = '#3F8F4A',
  actionLabel = 'Inspect Harvest & Mandi Quotes',
  onAction,
  onChange,
  className,
}: CategoryDeckProps) {
  const displayCrops = useMemo(() => crops ?? CROPS.slice(0, 5), [crops])

  const resolvedCards: DeckCard[] = useMemo(() => {
    if (cards) return cards

    return displayCrops.map((crop) => ({
      id: crop.id,
      title: crop.name,
      subtitle: `${crop.category} · ${crop.hindiName}`,
      art: (
        <div className="relative w-full h-full bg-[#131A12] flex items-center justify-center overflow-hidden p-4">
          <img
            src={crop.image}
            alt={crop.name}
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0A]/90 via-transparent to-transparent pointer-events-none" />
        </div>
      ),
      description: `Fresh, farmgate-inspected ${crop.name.toLowerCase()} sourced directly from marginal cultivators. Packaged in breathable organic crates with verified grade certification.`,
      specs: [
        { label: 'Floor Rate', value: `₹${crop.basePrice}/${crop.unit}` },
        { label: 'Shelf Life', value: `${crop.shelfLifeDays} Days` },
        { label: 'Category', value: crop.category },
      ],
      price: `₹${crop.basePrice}/${crop.unit}`,
    }))
  }, [cards, displayCrops])

  return (
    <div className="flex flex-col items-center w-full">
      <CardStack
        cards={resolvedCards}
        accent={accent}
        actionLabel={actionLabel}
        onAction={onAction}
        onChange={onChange}
        className={className}
      />
    </div>
  )
}
