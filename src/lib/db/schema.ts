import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Better Auth Tables
export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});

// App Tables
export const datasets = sqliteTable('dataset', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  rowCount: integer('rowCount').notNull(),
  suspiciousCount: integer('suspiciousCount').notNull(),
  averageScore: real('averageScore').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const analyses = sqliteTable('analysis', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  datasetId: text('datasetId').references(() => datasets.id, { onDelete: 'cascade' }),
  reviewContent: text('reviewContent').notNull(),
  productCategory: text('productCategory'),
  starRating: integer('starRating'),
  reviewerName: text('reviewerName'),
  reviewDate: text('reviewDate'),
  productUrl: text('productUrl'),
  classification: text('classification').notNull(), // 'likely_genuine' | 'suspicious' | 'likely_fake'
  authenticityScore: real('authenticityScore').notNull(), // 0 - 100
  confidence: real('confidence').notNull(), // 0 - 100
  summary: text('summary').notNull(),
  signals: text('signals').notNull(), // JSON string
  highlightedPhrases: text('highlightedPhrases').notNull(), // JSON string
  recommendedAction: text('recommendedAction').notNull(), // 'allow' | 'monitor' | 'manual_review'
  isDemo: integer('isDemo', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const feedbacks = sqliteTable('feedback', {
  id: text('id').primaryKey(),
  analysisId: text('analysisId').notNull().references(() => analyses.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // 'correct' | 'incorrect'
  notes: text('notes'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});
