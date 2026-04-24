import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Create a temporary project directory with the given file structure.
 * Returns the path to the temp directory.
 * Call cleanup() when done.
 */
export function createFixture(files: Record<string, string>): {
  path: string;
  cleanup: () => void;
} {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "onboarder-test-"));

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf-8");
  }

  return {
    path: dir,
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}
