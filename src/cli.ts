import { Command, EnumType } from "@cliffy/command";
import { version } from "./version.ts";
import { generateCsv, generateLayoutFile } from "./mod.ts";
import { delimiter } from "./types/delimiter.ts";
const delimiters = new EnumType(delimiter);

try {
  await new Command()
    .name("csvgen")
    .version(version)
    .description("dummy csv generator")
    .meta("deno", Deno.version.deno)
    .meta("v8", Deno.version.v8)
    .meta("typescript", Deno.version.typescript)
    .type("delimiters", delimiters)
    .option("-l, --layout=<input:file>", "Path to the layout file ", {
      required: true,
    })
    .option("-d, --delimiter <delimiter:delimiters>", "Specify the delimiter", {
      default: "comma",
    })
    .option("-o, --output <filepath:file>", "Path to the output file", {
      default: "./dummy.csv",
    })
    .option("-n, --rows <rows:number>", "Number of rows", { default: 10 })
    .option("--no-header", "Generate CSV without header.")
    .stopEarly()
    .action(async (options) => {
      await generateCsv(options);
    })
    .command(
      "layout",
      new Command()
        .action(() => {
          generateLayoutFile();
        }).description("Output a sample JSON layout file."),
    ).parse(Deno.args);
} catch (err) {
  console.info(err);
}
