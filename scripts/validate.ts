import path from "path";
import { validateAllDotfiles } from "../src/lib/parser";

const DOTFILES_DIR = path.join(process.cwd(), "dotfiles");

console.log("🔍 Validating dotfiles in ./dotfiles/\n");

const { valid, errors } = validateAllDotfiles(DOTFILES_DIR);

for (const file of valid) {
  console.log(`  ✓ ${file}`);
}

if (errors.length > 0) {
  console.log("");
  for (const err of errors) {
    console.error(`  ✗ ${err.file}`);
    for (const msg of err.errors) {
      console.error(`    → ${msg}`);
    }
  }
  console.log(
    `\n❌ Validation failed: ${errors.length} file(s) with errors, ${valid.length} valid\n`
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ All ${valid.length} dotfiles are valid\n`
  );
}
