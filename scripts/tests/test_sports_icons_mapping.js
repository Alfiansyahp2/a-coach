/**
 * Verification Test Suite: 33 Sports Icons Mapping & Rendering
 */

import assert from "assert";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { SYSTEM_SPORTS } from "@/lib/domain/sports/systemSportsRegistry";
import {
  SportIcon,
  SPORT_ICON_COMPONENT_MAP,
  CLUSTER_DEFAULT_ICONS,
  CLUSTER_COLOR_MAP,
} from "@/components/sports/SportIcon";

console.log("================================================================================");
console.log("RUNNING: 33 World Sports Icons Mapping & Rendering Verification");
console.log("================================================================================");

let totalPassed = 0;

// Test 1: Every one of the 33 sports has an entry in SPORT_ICON_COMPONENT_MAP
console.log("\n[Group 1] Verifying all 33 sports have a tailored icon mapped...");
assert.strictEqual(SYSTEM_SPORTS.length, 33, "Expected exactly 33 sports in SYSTEM_SPORTS");

for (const sport of SYSTEM_SPORTS) {
  const icon = SPORT_ICON_COMPONENT_MAP[sport.code];
  assert.ok(
    icon,
    `Sport '${sport.name}' (${sport.code}) must have a mapped icon in SPORT_ICON_COMPONENT_MAP`
  );
  assert.ok(
    typeof icon === "function" || (typeof icon === "object" && icon !== null),
    `Icon for ${sport.code} must be a valid React Component`
  );

  // Render to static markup
  const rendered = ReactDOMServer.renderToStaticMarkup(
    React.createElement(SportIcon, { sportCode: sport.code, cluster: sport.cluster })
  );
  assert.ok(rendered.includes("<svg"), `Rendered output for ${sport.code} must contain <svg> tag`);
  totalPassed++;
}
console.log(`PASS: All ${SYSTEM_SPORTS.length} sports mapped to valid, renderable icons.`);

// Test 2: Distinctiveness Check across individual sports
console.log("\n[Group 2] Verifying distinctiveness across critical sports...");

// Lari must NOT have Bike icon
const runComp = SPORT_ICON_COMPONENT_MAP["SPORT_DISTANCE_RUNNING"];
const bikeComp = SPORT_ICON_COMPONENT_MAP["SPORT_ROAD_CYCLING"];
assert.notStrictEqual(runComp, bikeComp, "Lari (Running) and Bike must not have the same icon!");
totalPassed++;

// Swimming must NOT have Bike icon
const swimComp = SPORT_ICON_COMPONENT_MAP["SPORT_SWIMMING"];
assert.notStrictEqual(swimComp, bikeComp, "Renang (Swimming) and Bike must not have the same icon!");
totalPassed++;

// Boxing must NOT have Swords or Dumbbell icon
const boxComp = SPORT_ICON_COMPONENT_MAP["SPORT_BOXING"];
const mmaComp = SPORT_ICON_COMPONENT_MAP["SPORT_MMA"];
assert.notStrictEqual(boxComp, mmaComp, "Boxing and MMA must have distinct icons!");
totalPassed++;

// Archery must NOT have Crosshair
const archComp = SPORT_ICON_COMPONENT_MAP["SPORT_ARCHERY"];
const shootComp = SPORT_ICON_COMPONENT_MAP["SPORT_SHOOTING"];
assert.notStrictEqual(archComp, shootComp, "Archery and Shooting must have distinct icons!");
totalPassed++;

// Badminton must NOT have Volleyball
const bultangComp = SPORT_ICON_COMPONENT_MAP["SPORT_BADMINTON"];
const voliComp = SPORT_ICON_COMPONENT_MAP["SPORT_VOLLEYBALL"];
assert.notStrictEqual(bultangComp, voliComp, "Badminton and Volleyball must have distinct icons!");
totalPassed++;

// Football must NOT have Basketball
const soccerComp = SPORT_ICON_COMPONENT_MAP["SPORT_FOOTBALL"];
const basketComp = SPORT_ICON_COMPONENT_MAP["SPORT_BASKETBALL"];
assert.notStrictEqual(soccerComp, basketComp, "Soccer and Basketball must have distinct icons!");
totalPassed++;

// Tennis must NOT have Table Tennis
const tennisComp = SPORT_ICON_COMPONENT_MAP["SPORT_TENNIS"];
const tableTennisComp = SPORT_ICON_COMPONENT_MAP["SPORT_TABLE_TENNIS"];
assert.notStrictEqual(tennisComp, tableTennisComp, "Tennis and Table Tennis must have distinct icons!");
totalPassed++;

console.log("PASS: Sports within and across clusters have specialized, distinct icons.");

// Test 3: Fallback resolution for custom/unmapped sports
console.log("\n[Group 3] Verifying fallback behavior for custom sports...");
const customMarkup = ReactDOMServer.renderToStaticMarkup(
  React.createElement(SportIcon, { sportCode: "SPORT_CUSTOM_GOLF", cluster: "RACQUET_PRECISION" })
);
assert.ok(customMarkup.includes("<svg"), "Custom sport must render fallback SVG icon");
assert.ok(customMarkup.includes("text-purple-400"), "Custom racquet sport should receive cluster color");
totalPassed++;

// Test by sportName string
const nameLookupMarkup = ReactDOMServer.renderToStaticMarkup(
  React.createElement(SportIcon, { sportName: "Lari Jarak Jauh & Maraton" })
);
assert.ok(nameLookupMarkup.includes("<svg"), "Lookup by sportName should render successfully");
totalPassed++;

console.log("\n================================================================================");
console.log(`ALL TESTS PASSED: ${totalPassed} checks verified successfully.`);
console.log("================================================================================");
