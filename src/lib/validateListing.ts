import type { ListingInput } from "./produceTypes";

export type ListingErrors = Partial<Record<keyof ListingInput, string>>;

export function validateListing(input: ListingInput): ListingErrors {
  const errors: ListingErrors = {};

  if (!input.cropName.trim()) errors.cropName = "Crop name is required";
  if (!input.variety.trim()) errors.variety = "Variety is required";

  if (!Number.isFinite(input.quantityKg) || input.quantityKg <= 0)
    errors.quantityKg = "Quantity must be greater than 0";

  if (!Number.isFinite(input.askingPrice) || input.askingPrice <= 0)
    errors.askingPrice = "Price must be greater than 0";

  if (!["A", "B", "C"].includes(input.qualityGrade))
    errors.qualityGrade = "Select a quality grade";

  if (!input.harvestDate) {
    errors.harvestDate = "Harvest date is required";
  } else if (new Date(input.harvestDate) > new Date()) {
    errors.harvestDate = "Harvest date cannot be in the future";
  }

  if (!input.location.trim()) errors.location = "Location is required";

  return errors;
}

export const hasErrors = (e: ListingErrors) => Object.keys(e).length > 0;