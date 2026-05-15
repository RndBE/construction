import {
  mysqlTable,
  varchar,
  text,
  int,
  bigint,
  double,
  decimal,
  boolean,
  date,
  datetime,
  timestamp,
  mysqlEnum,
  json,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================
// AUTH & USER TABLES
// ============================================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", [
    "owner",
    "project_manager",
    "mandor",
    "admin_keuangan",
    "viewer",
  ])
    .notNull()
    .default("viewer"),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: datetime("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// PROJECT TABLES
// ============================================================

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(), // PRJ-001
  name: varchar("name", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }).notNull(),
  address: text("address"),
  // Coordinates — tanpa PostGIS, simpan lat/lng sebagai DOUBLE
  latitude: double("latitude"),
  longitude: double("longitude"),
  // Geofence polygon — simpan sebagai JSON array of [lng, lat] pairs
  siteBoundary: json("site_boundary"), // [[lng,lat], [lng,lat], ...]
  startDate: date("start_date"),
  endDate: date("end_date"),
  contractValue: bigint("contract_value", { mode: "number" }).notNull().default(0),
  status: mysqlEnum("status", [
    "perencanaan",
    "berjalan",
    "selesai",
    "pemeliharaan",
    "arsip",
  ])
    .notNull()
    .default("perencanaan"),
  type: varchar("type", { length: 100 }), // Gedung, Perumahan, Infrastruktur
  picId: varchar("pic_id", { length: 36 }).references(() => users.id),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ============================================================
// RAB & WORK ITEMS
// ============================================================

export const workItems = mysqlTable("work_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id", { length: 36 }), // self-reference untuk hierarki
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 20 }), // m³, m², kg, ls, zak, batang
  volume: decimal("volume", { precision: 12, scale: 3 }).default("0"),
  unitPrice: bigint("unit_price", { mode: "number" }).default(0),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// MATERIAL
// ============================================================

export const materials = mysqlTable("materials", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 30 }).notNull(), // zak, batang, kubik, buah
  defaultPrice: bigint("default_price", { mode: "number" }).default(0),
  category: varchar("category", { length: 100 }),
  minStock: int("min_stock").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectMaterials = mysqlTable("project_materials", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  materialId: varchar("material_id", { length: 36 })
    .notNull()
    .references(() => materials.id),
  qtyPlanned: decimal("qty_planned", { precision: 12, scale: 3 }).default("0"),
  qtyUsed: decimal("qty_used", { precision: 12, scale: 3 }).default("0"),
  supplier: varchar("supplier", { length: 255 }),
  price: bigint("price", { mode: "number" }).default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// WORKERS (TUKANG)
// ============================================================

export const workers = mysqlTable("workers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  skill: mysqlEnum("skill", [
    "batu",
    "kayu",
    "besi",
    "las",
    "finishing",
    "listrik",
    "pipa",
  ]).notNull(),
  dailyRate: bigint("daily_rate", { mode: "number" }).default(0),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// ATTENDANCE (ABSENSI)
// ============================================================

export const attendance = mysqlTable("attendance", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workerId: varchar("worker_id", { length: 36 })
    .notNull()
    .references(() => workers.id),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  hours: decimal("hours", { precision: 4, scale: 1 }).default("8"),
  // GPS check-in
  checkinLat: double("checkin_lat"),
  checkinLng: double("checkin_lng"),
  checkinValid: boolean("checkin_valid").default(false),
  // Borongan reference
  workItemId: varchar("work_item_id", { length: 36 }).references(
    () => workItems.id
  ),
  amount: bigint("amount", { mode: "number" }).default(0),
  type: mysqlEnum("type", ["harian", "borongan"]).notNull().default("harian"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// PROGRESS TRACKING
// ============================================================

export const progressLogs = mysqlTable("progress_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workItemId: varchar("work_item_id", { length: 36 })
    .notNull()
    .references(() => workItems.id, { onDelete: "cascade" }),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),
  volumeActual: decimal("volume_actual", { precision: 12, scale: 3 }),
  notes: text("notes"),
  weather: mysqlEnum("weather", ["cerah", "mendung", "hujan"]),
  // Photos — JSON array of { url, gpsLat, gpsLng, takenAt }
  photos: json("photos"),
  // Mandor yang input
  createdById: varchar("created_by_id", { length: 36 }).references(
    () => users.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// FIELD DIARY (DIARY LAPANGAN)
// ============================================================

export const fieldDiaries = mysqlTable("field_diaries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  weather: mysqlEnum("weather", ["cerah", "mendung", "hujan"]).notNull(),
  workersPresentBySkill: json("workers_present_by_skill"), // { batu: 5, kayu: 3, ... }
  materialReceived: json("material_received"), // [{ materialId, qty }]
  issues: text("issues"), // Kendala & catatan
  visitors: text("visitors"), // Tamu kunjungan
  notes: text("notes"),
  createdById: varchar("created_by_id", { length: 36 }).references(
    () => users.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// EXPENSES & PAYMENTS
// ============================================================

export const expenses = mysqlTable("expenses", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", [
    "material",
    "upah",
    "alat",
    "overhead",
    "lainnya",
  ]).notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  date: date("date").notNull(),
  description: text("description"),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  approvedById: varchar("approved_by_id", { length: 36 }).references(
    () => users.id
  ),
  status: mysqlEnum("expense_status", ["pending", "approved", "rejected"])
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: mysqlEnum("payment_type", ["dp", "termin", "retensi", "lainnya"])
    .notNull()
    .default("termin"),
  amount: bigint("amount", { mode: "number" }).notNull(),
  date: date("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// SITE POINTS (TITIK PENTING DI SITE)
// ============================================================

export const sitePoints = mysqlTable("site_points", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("point_type", [
    "pos_jaga",
    "gudang",
    "akses",
    "parkir",
    "mck",
    "lainnya",
  ]).notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// AUDIT LOG
// ============================================================

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // CREATE, UPDATE, DELETE
  tableName: varchar("table_name", { length: 100 }).notNull(),
  recordId: varchar("record_id", { length: 36 }).notNull(),
  oldValue: json("old_value"),
  newValue: json("new_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// PROJECT DOCUMENTS
// ============================================================

export const projectDocuments = mysqlTable("project_documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("doc_type", [
    "kontrak",
    "gambar_kerja",
    "imb",
    "foto_lapangan",
    "lainnya",
  ]).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileSize: int("file_size"), // bytes
  uploadedById: varchar("uploaded_by_id", { length: 36 }).references(
    () => users.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  projects: many(projects),
  progressLogs: many(progressLogs),
  fieldDiaries: many(fieldDiaries),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  pic: one(users, {
    fields: [projects.picId],
    references: [users.id],
  }),
  workItems: many(workItems),
  progressLogs: many(progressLogs),
  fieldDiaries: many(fieldDiaries),
  materials: many(projectMaterials),
  expenses: many(expenses),
  payments: many(payments),
  attendance: many(attendance),
  sitePoints: many(sitePoints),
  documents: many(projectDocuments),
}));

export const workItemsRelations = relations(workItems, ({ one, many }) => ({
  project: one(projects, {
    fields: [workItems.projectId],
    references: [projects.id],
  }),
  parent: one(workItems, {
    fields: [workItems.parentId],
    references: [workItems.id],
    relationName: "parentChild",
  }),
  children: many(workItems, { relationName: "parentChild" }),
  progressLogs: many(progressLogs),
}));

export const progressLogsRelations = relations(progressLogs, ({ one }) => ({
  workItem: one(workItems, {
    fields: [progressLogs.workItemId],
    references: [workItems.id],
  }),
  project: one(projects, {
    fields: [progressLogs.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [progressLogs.createdById],
    references: [users.id],
  }),
}));

export const fieldDiariesRelations = relations(fieldDiaries, ({ one }) => ({
  project: one(projects, {
    fields: [fieldDiaries.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [fieldDiaries.createdById],
    references: [users.id],
  }),
}));
