import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const courseStatus = pgEnum("course_status", ["draft", "published"]);
export const videoProvider = pgEnum("video_provider", ["youtube", "vimeo"]);

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const course = pgTable(
  "course",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    description: text().notNull().default(""),
    status: courseStatus().notNull().default("draft"),
    teacherId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (t) => [index().on(t.teacherId), index().on(t.status)],
);

export const courseModule = pgTable(
  "course_module",
  {
    id: uuid().primaryKey().defaultRandom(),
    courseId: uuid()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text().notNull(),
    position: integer().notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.courseId, t.position)],
);

export const lesson = pgTable(
  "lesson",
  {
    id: uuid().primaryKey().defaultRandom(),
    moduleId: uuid()
      .notNull()
      .references(() => courseModule.id, { onDelete: "cascade" }),
    title: text().notNull(),
    content: text().notNull().default(""),
    videoUrl: text(),
    videoProvider: videoProvider(),
    videoId: text(),
    position: integer().notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.moduleId, t.position)],
);

export const enrollment = pgTable(
  "enrollment",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: uuid()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.courseId), index().on(t.courseId)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: uuid()
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    completedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] }), index().on(t.lessonId)],
);

export const courseRelations = relations(course, ({ one, many }) => ({
  teacher: one(user, { fields: [course.teacherId], references: [user.id] }),
  modules: many(courseModule),
  enrollments: many(enrollment),
}));

export const courseModuleRelations = relations(courseModule, ({ one, many }) => ({
  course: one(course, { fields: [courseModule.courseId], references: [course.id] }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  module: one(courseModule, { fields: [lesson.moduleId], references: [courseModule.id] }),
  progress: many(lessonProgress),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, { fields: [enrollment.userId], references: [user.id] }),
  course: one(course, { fields: [enrollment.courseId], references: [course.id] }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(user, { fields: [lessonProgress.userId], references: [user.id] }),
  lesson: one(lesson, { fields: [lessonProgress.lessonId], references: [lesson.id] }),
}));
