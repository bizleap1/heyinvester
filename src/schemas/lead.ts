import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  preferredLocation: z.string().optional(),
  projectId: z.string().uuid().optional(),
  source: z.string().default("website"),
  message: z.string().optional(),
  leadType: z.enum(["general_enquiry", "project_enquiry", "site_visit", "callback", "whatsapp"]),
});

export const leadUpdateSchema = z.object({
    status: z.enum(["new", "contacted", "follow_up", "site_visit_scheduled", "converted", "closed"])
});
