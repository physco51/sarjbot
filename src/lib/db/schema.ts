import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const operators = sqliteTable("operators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  playStoreUrl: text("play_store_url"),
  appStoreUrl: text("app_store_url"),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => operators.id),
  chargeType: text("charge_type", { enum: ["AC", "DC", "HPC"] }).notNull(),
  priceMin: real("price_min").notNull(),
  priceMax: real("price_max"),
  unit: text("unit").default("TL/kWh"),
  note: text("note"),
  source: text("source"),
  sourceUrl: text("source_url"),
  isVerified: integer("is_verified", { mode: "boolean" }).default(true),
  isAvailable: integer("is_available", { mode: "boolean" }).default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => operators.id),
  chargeType: text("charge_type", { enum: ["AC", "DC", "HPC"] }).notNull(),
  priceMin: real("price_min").notNull(),
  priceMax: real("price_max"),
  source: text("source"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const scrapeLogs = sqliteTable("scrape_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(),
  status: text("status", { enum: ["success", "failure", "partial"] }).notNull(),
  operatorsUpdated: integer("operators_updated").default(0),
  errorMessage: text("error_message"),
  startedAt: integer("started_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
