import { Command, EnumType } from "@cliffy/command";
import { version } from "./version.ts";
import { generateCsv, generateLayoutFile } from "./mod.ts";
const delimiters = new EnumType(["comma", "tab", "space", "pipe"]);

try {
  await new Command()
    .name("csvgen")
    .version(version)
    .description("dummy csv generator")
    .meta("deno", Deno.version.deno)
    .meta("v8", Deno.version.v8)
    .meta("typescript", Deno.version.typescript)
    .type("delimiters", delimiters)
    .option("-l, --layout=<input:file>", "layout file path", { required: true })
    .option("-d, --delimiter <delimiter:delimiters>", "delimiter", {
      default: "comma",
    })
    .option("-o, --output <filepath:file>", "output file path", {
      default: "./dummy.csv",
    })
    .option("-n, --rows <rows:number>", "rows", { default: 10 })
    .option("-H, --no-header", "header-less")
    .stopEarly()
    .action(async (options) => {
      await generateCsv(options);
    })
    .command(
      "layout",
      new Command()
        .action(() => {
          generateLayoutFile();
        }),
    ).parse(Deno.args);
} catch (err) {
  console.info(err);
}
