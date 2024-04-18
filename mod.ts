import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { layoutSchema } from "./types/layout.ts";
import { CsvStringifyStream } from "@std/csv";
import type { Column, Layout } from "./types/layout.ts";
import stub from "./stub_layout.json" with { type: "json" };

function generateRandomValue(column: Column) {
    switch (column.type) {
        case "string":
            return faker.string.numeric({
                length: { min: column.min, max: column.max },
            });
        case "integer":
            return faker.number.int({ min: column.min, max: column.max });
        case "boolean":
            return faker.number.int({ min: 0, max: 1 });
        case "timestamp":
            return format(new Date(), "yyyy-mm-dd HH:MM:SS");
        case "date":
            return format(new Date(), "yyyy-mm-dd");
        case "time":
            return format(new Date(), "HH:MM");
    }
}

function generateRow(layout: Layout): Record<string, any> {
    return layout.columns.reduce((row, column) => {
        row[column.name] = generateRandomValue(column);
        return row;
        // deno-lint-ignore no-explicit-any
    }, {} as Record<string, any>);
}
function generateOutput(schema: Layout, numRecords: number) {
    return Array.from({ length: numRecords }, () => generateRow(schema));
}
function getDelimiter(delimiter: "comma" | "tab" | "space" | "pipe") {
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

export async function generateCsv(
    _layout: string,
    delimiter: "comma" | "tab" | "space" | "pipe",
    output: string,
    rows: number,
) {
    // JSON読み取り処理
    const json = JSON.parse(await Deno.readTextFile(_layout))
    const layout = layoutSchema.parse(json);
    const csvHeaders = layout.columns.map((c) => c.name);
    // 書き込み処理
    const file = await Deno.open(output, {
        create: true,
        write: true,
        truncate: true,
    });
    ReadableStream.from(generateOutput(layout, rows))
        .pipeThrough(
            new CsvStringifyStream({
                columns: csvHeaders,
                separator: getDelimiter(delimiter),
            }),
        )
        .pipeThrough(new TextEncoderStream())
        .pipeTo(file.writable);
}

export async function generateLayoutFile() {
    const fileName = "./layout-sample.json";
    await Deno.create(fileName);
    await Deno.writeTextFile(fileName, JSON.stringify(stub, undefined, 4));
}
