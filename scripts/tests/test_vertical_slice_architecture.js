/**
 * Verification Test Suite: Vertical Slice Architecture by Sport
 * Validates: docs/11-ai/08-SPESIFIKASI_ARSITEKTUR_CLEAN_VERTICAL_SLICE_CABOR.md
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sportCoordinatorRouter } from "@/lib/domain/coach";
import { SYSTEM_SPORTS } from "@/lib/domain/sports/systemSportsRegistry";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../");
const COACH_DIR = path.join(ROOT, "src/lib/domain/coach");
const CORE_DIR = path.join(COACH_DIR, "core");
const SPORTS_DIR = path.join(COACH_DIR, "sports");

console.log("================================================================================");
console.log("RUNNING: Vertical Slice Architecture by Sport Verification Suite");
console.log("================================================================================");

let totalPassed = 0;

// Test 1: Verify Core Orchestrator files
console.log("\n[Group 1] Verifying core/ orchestrator and contracts...");
assert.ok(fs.existsSync(path.join(CORE_DIR, "contracts.ts")), "core/contracts.ts must exist");
assert.ok(fs.existsSync(path.join(CORE_DIR, "SportCoordinatorRouter.ts")), "core/SportCoordinatorRouter.ts must exist");
assert.ok(fs.existsSync(path.join(CORE_DIR, "index.ts")), "core/index.ts must exist");
totalPassed += 3;
console.log("PASS: Core orchestrator files exist.");

// Test 2: Verify 33 sport slices exist with isolated folder structure
console.log("\n[Group 2] Verifying all 33 sport vertical slice folders...");
const EXPECTED_SLICES = [
  "running", "road-cycling", "mtb-xc", "powerlifting", "weightlifting",
  "calisthenics", "strongman", "bodybuilding", "football", "basketball",
  "volleyball", "futsal", "rugby", "field-hockey", "boxing", "mma",
  "bjj", "pencak-silat", "judo", "muay-thai", "badminton", "tennis",
  "table-tennis", "archery", "shooting", "swimming", "rowing",
  "triathlon", "crossfit-hyrox", "climbing", "gymnastics", "surfing", "skateboarding"
];

assert.strictEqual(EXPECTED_SLICES.length, 33, "Must have exactly 33 expected slices");
for (const slice of EXPECTED_SLICES) {
  const sliceDir = path.join(SPORTS_DIR, slice);
  assert.ok(fs.existsSync(sliceDir), `Slice directory must exist: sports/${slice}`);
  assert.ok(fs.existsSync(path.join(sliceDir, "index.ts")), `Slice index.ts must exist: sports/${slice}/index.ts`);

  // Verify at least one CoachAgent file exists in the slice
  const files = fs.readdirSync(sliceDir);
  const agentFile = files.find((f) => f.endsWith("CoachAgent.ts"));
  assert.ok(agentFile, `Slice must contain a CoachAgent: sports/${slice}/${agentFile}`);
  totalPassed += 3;
}
console.log(`PASS: All 33 sport slices verified with dedicated folder and barrel exports.`);

// Test 3: Zero Inter-Sport Coupling (Strict Isolation Principle)
console.log("\n[Group 3] Enforcing Zero Inter-Sport Coupling (No cross-slice imports)...");
for (const slice of EXPECTED_SLICES) {
  const sliceDir = path.join(SPORTS_DIR, slice);
  const files = fs.readdirSync(sliceDir).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    const content = fs.readFileSync(path.join(sliceDir, file), "utf8");
    for (const otherSlice of EXPECTED_SLICES) {
      if (otherSlice !== slice) {
        assert.ok(
          !content.includes(`../${otherSlice}`),
          `FORBIDDEN: Slice '${slice}' must NOT import directly from '${otherSlice}'!`
        );
      }
    }
  }
}
totalPassed += 1;
console.log("PASS: 100% Zero Inter-Sport Coupling verified across all slices.");

// Test 4: Registry integration with Router
console.log("\n[Group 4] Verifying all 33 agents registered in SportCoordinatorRouter...");
const registered = sportCoordinatorRouter.listAgents();
assert.strictEqual(registered.length, 33, `Router must contain exactly 33 registered agents (Found: ${registered.length})`);
for (const item of SYSTEM_SPORTS) {
  const agent = sportCoordinatorRouter.getAgent(item.code);
  assert.ok(agent, `Agent for ${item.name} (${item.code}) must be retrievable from router`);
  totalPassed += 1;
}
console.log("PASS: All 33 agents are live and retrievable via SportCoordinatorRouter.");

// Test 5: Verify strict < 300 lines limit per file in sports/
console.log("\n[Group 5] Verifying strict < 300 lines limit per file...");
for (const slice of EXPECTED_SLICES) {
  const sliceDir = path.join(SPORTS_DIR, slice);
  const files = fs.readdirSync(sliceDir).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    const lines = fs.readFileSync(path.join(sliceDir, file), "utf8").split("\n").length;
    assert.ok(lines < 300, `File sports/${slice}/${file} has ${lines} lines, exceeding 300!`);
    totalPassed += 1;
  }
}
console.log("PASS: 100% of files in sports/ strictly comply with < 300 lines limit.");

console.log("\n================================================================================");
console.log(`ALL TESTS PASSED: ${totalPassed} checks verified successfully.`);
console.log("================================================================================");
