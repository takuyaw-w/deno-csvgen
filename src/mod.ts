import { CsvStringifyStream } from "@std/csv";
import { dirname } from "@std/path";
import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { layoutSchema } from "./types/layout.ts";
import type { Column, Layout } from "./types/layout.ts";
import type { Delimiter } from "./types/delimiter.ts";
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

function createDataStream(
  layout: Layout,
  numRecords: number,
): ReadableStream<Record<string, string | number | boolean>> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < numRecords) {
        controller.enqueue(generateRow(layout));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

function getDelimiter(delimiter: Delimiter) {
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

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export async function generateCsv(options: {
  layout: string;
  delimiter: Delimiter;
  output: string;
  rows: number;
  header: boolean;
}) {
  // JSON読み取り処理
  const json = JSON.parse(await Deno.readTextFile(options.layout));
  const layout = layoutSchema.parse(json);
  const dirPath = dirname(options.output);
  await Deno.mkdir(dirPath, { recursive: true });
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
  const dataStream = createDataStream(layout, options.rows)
    .pipeThrough(
      new CsvStringifyStream({
        columns: layout.columns.map((c) => c.name),
        separator: getDelimiter(options.delimiter),
      }),
    )
    .pipeThrough(new TextEncoderStream());

  const reader = dataStream.getReader();

  if (!options.header) {
    await reader.read();
  }

  let buffer: Uint8Array[] = [];
  const BATCH_SIZE = 1000;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer.push(value);

    if (buffer.length >= BATCH_SIZE) {
      await file.write(concatUint8Arrays(buffer));
      buffer = [];
    }
    progress.render(completed++);
  }

  if (buffer.length > 0) {
    await file.write(concatUint8Arrays(buffer));
  }

  file.close();
}

export async function generateLayoutFile() {
  const fileName = "./layout-sample.json";
  await Deno.writeTextFile(fileName, JSON.stringify(stub_layout, undefined, 4));
}
