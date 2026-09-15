import { execSync } from 'child_process';

try {
  console.log("Testing build check...");
  const out = execSync("npx tsc --noEmit", { cwd: "d:/HAC/ekam-sanskriti", encoding: "utf8" });
  console.log("TypeScript Check Success!");
} catch (err) {
  console.log("TSC Output:\n", err.stdout || err.message);
}
