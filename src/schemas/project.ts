import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  corridor: z.string().nullable().optional(),
  projectType: z.enum(["residential", "commercial", "residential_commercial"]),
  status: z.enum(["available", "coming_soon", "sold_out", "pre_launch", "inactive"]),
  pricePerSqft: z.string().min(1, "Price is required"),
  startingPrice: z.string().nullable().optional(),
  reraNumber: z.string().nullable().optional(),
  loanPercentage: z.string().nullable().optional(),
  nmrdaApproved: z.boolean().default(false),
  rlApproved: z.boolean().default(false),
  titleClear: z.boolean().default(false),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().default(0),
  coverImageBase64: z.string().nullable().optional(), // Used during form submission
  layoutImageBase64: z.string().nullable().optional(), // Used during form submission
  coverImageUrl: z.string().nullable().optional(),
  coverImagePublicId: z.string().nullable().optional(),
  layoutImageUrl: z.string().nullable().optional(),
  layoutImagePublicId: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  
  // Plot sizes
  plotSizes: z.array(z.object({
      id: z.string().nullable().optional(),
      sizeSqFt: z.union([z.string(), z.number()]).transform(val => String(val)),
      label: z.string().nullable().optional(),
  })).nullable().optional(),
  
  // Amenities
  amenities: z.array(z.object({
      id: z.string().nullable().optional(),
      name: z.string(),
      icon: z.string().nullable().optional()
  })).nullable().optional(),
  
  // Location Advantages
  locationAdvantages: z.array(z.object({
      id: z.string().nullable().optional(),
      landmark: z.string(),
      distance: z.string(),
      travelTime: z.string().nullable().optional()
  })).nullable().optional(),
  
  // Gallery
  galleryImages: z.array(z.object({
      id: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      publicId: z.string().nullable().optional(),
  })).nullable().optional(),
  
  galleryImagesBase64: z.array(z.string()).nullable().optional(),
});
