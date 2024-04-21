import { z } from "zod";

const BaseColumnSchema = z.object({
  name: z.string().min(1),
  type: z.literal("base"),
});

const StringColumnSchema = BaseColumnSchema.merge(z.object({
  type: z.literal("string"),
  min: z.number(),
  max: z.number(),
}));

export type StringColumn = z.infer<typeof StringColumnSchema>;

const ChoicesColumnSchema = BaseColumnSchema.merge(
  z.object({
    type: z.literal("choices"),
    choices: z.array(z.string().min(1)).min(2),
  }),
);

export type ChoicesColumn = z.infer<typeof ChoicesColumnSchema>;

const IntegerColumnSchema = BaseColumnSchema.merge(z.object({
  type: z.literal("integer"),
  min: z.number(),
  max: z.number(),
}));

export type IntegerColumn = z.infer<typeof IntegerColumnSchema>;

const TimestampColumnSchema = BaseColumnSchema.merge(z.object({
  type: z.literal("timestamp"),
}));

export type TimestampColumn = z.infer<typeof TimestampColumnSchema>;

const DateColumnSchema = BaseColumnSchema.merge(z.object({
  type: z.literal("date"),
}));

export type DateColumn = z.infer<typeof DateColumnSchema>;

const TimeColumnSchema = BaseColumnSchema.merge(z.object({
  type: z.literal("time"),
}));

export type TimeColumn = z.infer<typeof TimeColumnSchema>;

const BooleanColumnSchema = BaseColumnSchema.merge(z.object({
  type: z.literal("boolean"),
}));

export type BooleanColumn = z.infer<typeof BooleanColumnSchema>;

const ColumnSchema = z.discriminatedUnion("type", [
  StringColumnSchema,
  ChoicesColumnSchema,
  IntegerColumnSchema,
  TimestampColumnSchema,
  DateColumnSchema,
  TimeColumnSchema,
  BooleanColumnSchema,
]);

export type Column = z.infer<typeof ColumnSchema>;

export type ColumnType = Column["type"];

export const layoutSchema = z.object({
  columns: z.array(ColumnSchema),
});

export type Layout = z.infer<typeof layoutSchema>;
