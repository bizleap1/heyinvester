import { pgTable, text, timestamp, boolean, uuid, integer, pgEnum, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["super_admin", "admin"]);
export const projectTypeEnum = pgEnum("project_type", ["residential", "commercial", "residential_commercial"]);
export const statusEnum = pgEnum("status", ["available", "coming_soon", "sold_out", "pre_launch", "inactive"]);
export const imageTypeEnum = pgEnum("image_type", ["gallery", "masterplan", "location", "amenity", "brochure", "site_photo"]);
export const leadTypeEnum = pgEnum("lead_type", ["general_enquiry", "project_enquiry", "site_visit", "callback", "whatsapp"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "follow_up", "site_visit_scheduled", "converted", "closed"]);

// Better Auth core tables
export const user = pgTable("user", {
					id: text("id").primaryKey(),
					name: text('name').notNull(),
					email: text('email').notNull().unique(),
					emailVerified: boolean('emailVerified').notNull(),
					image: text('image'),
					createdAt: timestamp('createdAt').notNull(),
					updatedAt: timestamp('updatedAt').notNull(),
     role: text('role'),
     banned: boolean('banned'),
     banReason: text('banReason'),
     banExpires: timestamp('banExpires')
});

export const session = pgTable("session", {
					id: text("id").primaryKey(),
					expiresAt: timestamp('expiresAt').notNull(),
					token: text('token').notNull().unique(),
					createdAt: timestamp('createdAt').notNull(),
					updatedAt: timestamp('updatedAt').notNull(),
					ipAddress: text('ipAddress'),
					userAgent: text('userAgent'),
					userId: text('userId').notNull().references(() => user.id)
});

export const account = pgTable("account", {
					id: text("id").primaryKey(),
					accountId: text('accountId').notNull(),
					providerId: text('providerId').notNull(),
					userId: text('userId').notNull().references(() => user.id),
					accessToken: text('accessToken'),
					refreshToken: text('refreshToken'),
					idToken: text('idToken'),
					accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
					refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
					scope: text('scope'),
					password: text('password'),
					createdAt: timestamp('createdAt').notNull(),
					updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
					id: text("id").primaryKey(),
					identifier: text('identifier').notNull(),
					value: text('value').notNull(),
					expiresAt: timestamp('expiresAt').notNull(),
					createdAt: timestamp('createdAt'),
					updatedAt: timestamp('updatedAt')
});

// Admin Users (Better auth uses 'user', but the prompt specifically requested admin_users.
// We'll configure Better Auth to use 'admin_users' instead of 'user', or just map it).
// Wait, Better Auth allows customizing table names. I'll define admin_users.
export const adminUsers = pgTable("admin_users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    role: roleEnum("role").default("admin"),
});

export const adminSessions = pgTable("admin_sessions", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => adminUsers.id)
});

export const adminAccounts = pgTable("admin_accounts", {
    id: text("id").primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => adminUsers.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const adminVerifications = pgTable("admin_verifications", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt')
});


// Projects
export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("shortDescription").notNull(),
    description: text("description").notNull(),
    location: text("location").notNull(),
    corridor: text("corridor"),
    projectType: projectTypeEnum("projectType").notNull(),
    status: statusEnum("status").notNull(),
    pricePerSqft: text("pricePerSqft").notNull(), // using text to store "₹5,400 / sq.ft" as requested, or decimal? The prompt says pricePerSqft, let's make it text for flexibility or decimal. I'll use text as formatting varies.
    startingPrice: text("startingPrice"),
    reraNumber: text("reraNumber"),
    loanPercentage: text("loanPercentage"),
    nmrdaApproved: boolean("nmrdaApproved").default(false),
    rlApproved: boolean("rlApproved").default(false),
    titleClear: boolean("titleClear").default(false),
    published: boolean("published").default(false),
    isFeatured: boolean("isFeatured").default(false),
    displayOrder: integer("displayOrder").default(0),
    coverImageUrl: text("coverImageUrl"),
    coverImagePublicId: text("coverImagePublicId"),
    layoutImageUrl: text("layoutImageUrl"),
    layoutImagePublicId: text("layoutImagePublicId"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const projectPlotSizes = pgTable("project_plot_sizes", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    sizeSqFt: text("sizeSqFt").notNull(),
    label: text("label"),
    sortOrder: integer("sortOrder").default(0),
});

export const projectImages = pgTable("project_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    imageUrl: text("imageUrl").notNull(),
    cloudinaryPublicId: text("cloudinaryPublicId").notNull(),
    altText: text("altText"),
    imageType: imageTypeEnum("imageType").notNull(),
    sortOrder: integer("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projectAmenities = pgTable("project_amenities", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    icon: text("icon"),
    sortOrder: integer("sortOrder").default(0),
});

export const projectLocationAdvantages = pgTable("project_location_advantages", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    landmark: text("landmark").notNull(),
    distance: text("distance").notNull(),
    travelTime: text("travelTime"),
    sortOrder: integer("sortOrder").default(0),
});

export const projectDocuments = pgTable("project_documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    documentType: text("documentType"),
    fileUrl: text("fileUrl").notNull(),
    cloudinaryPublicId: text("cloudinaryPublicId").notNull(),
    verified: boolean("verified").default(false),
    sortOrder: integer("sortOrder").default(0),
});

export const heroSlides = pgTable("hero_slides", {
    id: uuid("id").primaryKey().defaultRandom(),
    desktopImageUrl: text("desktopImageUrl").notNull(),
    desktopImagePublicId: text("desktopImagePublicId").notNull(),
    mobileImageUrl: text("mobileImageUrl").notNull(),
    mobileImagePublicId: text("mobileImagePublicId").notNull(),
    heading: text("heading"),
    subheading: text("subheading"),
    ctaLabel: text("ctaLabel"),
    ctaUrl: text("ctaUrl"),
    active: boolean("active").default(true),
    sortOrder: integer("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    preferredLocation: text("preferredLocation"),
    projectId: uuid("projectId").references(() => projects.id, { onDelete: 'set null' }),
    source: text("source").default("website"),
    message: text("message"),
    leadType: leadTypeEnum("leadType").notNull(),
    status: leadStatusEnum("status").default("new").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
    id: text("id").primaryKey(), // We'll just have one row with id 'global'
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    address: text("address"),
    mahaReraNumber: text("mahaReraNumber"),
    instagramUrl: text("instagramUrl"),
    facebookUrl: text("facebookUrl"),
    youtubeUrl: text("youtubeUrl"),
    linkedinUrl: text("linkedinUrl"),
    heroSliderInterval: integer("heroSliderInterval").default(2500),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Relations

export const projectsRelations = relations(projects, ({ many }) => ({
    plotSizes: many(projectPlotSizes),
    images: many(projectImages),
    amenities: many(projectAmenities),
    locationAdvantages: many(projectLocationAdvantages),
    documents: many(projectDocuments),
}));

export const projectPlotSizesRelations = relations(projectPlotSizes, ({ one }) => ({
    project: one(projects, {
        fields: [projectPlotSizes.projectId],
        references: [projects.id],
    }),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
    project: one(projects, {
        fields: [projectImages.projectId],
        references: [projects.id],
    }),
}));

export const projectAmenitiesRelations = relations(projectAmenities, ({ one }) => ({
    project: one(projects, {
        fields: [projectAmenities.projectId],
        references: [projects.id],
    }),
}));

export const projectLocationAdvantagesRelations = relations(projectLocationAdvantages, ({ one }) => ({
    project: one(projects, {
        fields: [projectLocationAdvantages.projectId],
        references: [projects.id],
    }),
}));

export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
    project: one(projects, {
        fields: [projectDocuments.projectId],
        references: [projects.id],
    }),
}));
