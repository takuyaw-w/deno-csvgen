# Deno CSV Generator (deno-csvgen)

A command-line interface (CLI) tool to generate dummy CSV files using Deno.

## Installation

Please visit the [release page](https://github.com/takuyaw-w/deno-csvgen/releases) to download the latest version.

## Usage

```bash
csvgen --layout <input> [-d <delimiter>] [-o <filepath>] [-n <rows>]
```

### Options

- -h, --help: Show this help.
- -V, --version: Show the version number for this program.
- -l, --layout \<input\>: Path to the layout file (required).
- -d, --delimiter \<delimiter\>: Specify the delimiter (Default: "comma", Values: "comma", "tab", "space", "pipe").
- -o, --output \<filepath\>: Path to the output file (Default: "./dummy.csv").
- -n, --rows \<rows\>: Number of rows (Default: 10).
- -H, --no-header: Generate CSV without header.

Replace `<input>`, `<delimiter>`, `<filepath>`, and `<rows>` with the appropriate values according to your usage.

## Subcommands

### layout

Output a sample JSON layout file.

```shell
csvgen layout
```

This command will output a sample JSON layout file named layout-sample.json to the current directory.
