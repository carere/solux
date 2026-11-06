import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const fixtures = dirname(fileURLToPath(import.meta.url));
const root = resolve(fixtures, "../..");
const consumer = mkdtempSync(join(tmpdir(), "solux-packed-consumer-"));
function run(command: string[], cwd = consumer) {
  const [executable, ...args] = command;
  if (!executable) throw Error("Missing command");
  const result = spawnSync(executable, args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`${command.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
try {
  const filename = "solux.tgz";
  run(["bun", "pm", "pack", "--filename", join(consumer, filename)], root);
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: { "@carere/solux": `file:./${filename}` },
      devDependencies: { typescript: "5.9.3" },
    }),
  );
  writeFileSync(
    join(consumer, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
      },
      include: ["consumer.ts"],
    }),
  );
  for (const name of ["consumer.ts", "runtime.mjs"])
    copyFileSync(join(fixtures, name), join(consumer, name));
  run(["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund"]);
  const installed = JSON.parse(
    readFileSync(join(consumer, "node_modules/@carere/solux/package.json"), "utf8"),
  );
  if (!installed.dependencies["@redux-devtools/extension"] || !installed.dependencies.redux) {
    throw Error("Missing declaration dependencies");
  }
  run([join(consumer, "node_modules/.bin/tsc"), "--project", "tsconfig.json"]);
  console.log("Packed consumer declarations passed with skipLibCheck: false (NodeNext)");
  run([
    join(consumer, "node_modules/.bin/tsc"),
    "--project",
    "tsconfig.json",
    "--module",
    "ESNext",
    "--moduleResolution",
    "Bundler",
  ]);
  console.log("Packed consumer declarations passed with skipLibCheck: false (Bundler)");
  console.log(run(["node", "runtime.mjs"]));
  console.log(run(["node", "--conditions=browser", "runtime.mjs"]));
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
