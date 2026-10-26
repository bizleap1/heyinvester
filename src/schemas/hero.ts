import { z } from "zod";

export const heroSlideSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
  desktopImageBase64: z.string().optional(), // File inputs for upload
  mobileImageBase64: z.string().optional(),
});
