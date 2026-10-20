export type QualityGrade = "A" | "B" | "C";
export type ListingStatus = "Active" | "Supplied" | "Sold Out" | "Closed";

export interface ProduceListing {
  id: string;
  farmerId: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  askingPrice: number; // ₹/kg
  qualityGrade: QualityGrade;
  harvestDate: string; // YYYY-MM-DD
  location: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export type ListingInput = Omit<
  ProduceListing,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export interface SupplyRecord {
  id: string;
  listingId: string;
  farmerId: string;
  date: string;
  expectedKg: number;
  receivedKg: number;
  acceptedKg: number;
}

export interface SaleRecord {
  id: string;
  listingId: string;
  farmerId: string;
  date: string;
  orderId: string;
  quantityKg: number;
  pricePerKg: number;
}