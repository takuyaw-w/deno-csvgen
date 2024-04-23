import { CsvStringifyStream } from "@std/csv";
import { dirname } from '@std/path'
import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { layoutSchema } from "./types/layout.ts";
import type { Column, Layout } from "./types/layout.ts";
import type { delimiter } from "./types/delimiter.ts"
import ProgressBar from "@deno-library/progress";
import stub_layout from "./stubs/layout.json" with { type: "json" };

function generateRandomValue(column: Column) {
  switch (column.type) {
    case "string":
      return faker.string.numeric({
        length: { min: column.min, max: column.max },
      });
    case "choices":
      return faker.helpers.arrayElement(column.choices);
    case "integer":
      return faker.number.int({ min: column.min, max: column.max });
    case "boolean":
      return faker.number.int({ min: 0, max: 1 });
    case "timestamp":
      return format(faker.date.recent({ days: 5 }), "yyyy-MM-dd HH:mm:ss");
    case "date":
      return format(faker.date.recent({ days: 5 }), "yyyy-MM-dd");
    case "time":
      return format(faker.date.recent({ days: 5 }), "HH:mm");
  }
}

function generateRow(layout: Layout): Record<string, string | number> {
  return layout.columns.reduce((row, column) => {
    row[column.name] = generateRandomValue(column);
    return row;
  }, {} as Record<string, string | number>);
}

function generateOutput(schema: Layout, numRecords: number) {
  return Array.from({ length: numRecords }, () => generateRow(schema));
}

function getDelimiter(delimiter: delimiter) {
  switch (delimiter) {
    case "comma":
      return ",";
    case "tab":
      return "\t";
    case "space":
      return " ";
    case "pipe":
      return "|";
  }
}

export async function generateCsv(options: {
  layout: string;
  delimiter: delimiter;
  output: string;
  rows: number;
  header: boolean;
}) {
  // JSON読み取り処理
  const json = JSON.parse(await Deno.readTextFile(options.layout));
  const layout = layoutSchema.parse(json);
  const dirPath = dirname(options.output)
  await Deno.mkdir(dirPath, { recursive: true })
  // 書き込み処理
  const file = await Deno.open(options.output, {
    create: true,
    write: true,
    truncate: true,
  });
  let completed = options.header ? 0 : 1;
  const progress = new ProgressBar({
    title: options.output,
    total: options.rows,
    complete: "=",
    incomplete: "-",
  });
  const st = ReadableStream.from(generateOutput(layout, options.rows))
    .pipeThrough(
      new CsvStringifyStream({
        columns: layout.columns.map((c) => c.name),
        separator: getDelimiter(options.delimiter),
      }),
    )
    .pipeThrough(new TextEncoderStream());

  const re = st.getReader();

  if (!options.header) {
    await re.read();
  }

  while (true) {
    const { done, value } = await re.read();
    if (done) {
      break;
    }
    progress.render(completed++);
    await file.write(value);
  }

  file.close();
}

export async function generateLayoutFile() {
  const fileName = "./layout-sample.json";
  await Deno.create(fileName);
  await Deno.writeTextFile(fileName, JSON.stringify(stub_layout, undefined, 4));
}
