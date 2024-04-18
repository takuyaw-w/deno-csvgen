import { z } from "zod";

const StringColumn = z.object({
  name: z.string(),
  type: z.literal("string"),
  min: z.number(),
  max: z.number(),
});

const IntegerColumn = z.object({
  name: z.string(),
  type: z.literal("integer"),
  min: z.number(),
  max: z.number(),
});

const TimestampColumn = z.object({
  name: z.string(),
  type: z.literal("timestamp"),
});

const DateColumn = z.object({
  name: z.string(),
  type: z.literal("date"),
});

const TimeColumn = z.object({
  name: z.string(),
  type: z.literal("time"),
});

const BooleanColumn = z.object({
  name: z.string(),
  type: z.literal("boolean"),
});

const Column = z.discriminatedUnion("type", [
  StringColumn,
  IntegerColumn,
  TimestampColumn,
  DateColumn,
  TimeColumn,
  BooleanColumn,
]);

export type Column = z.infer<typeof Column>;

export type Type = Column["type"];

export const layoutSchema = z.object({
  columns: z.array(Column),
});

export type Layout = z.infer<typeof layoutSchema>;
