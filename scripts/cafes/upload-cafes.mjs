// Step 2: upload a reviewed seed file to the Firestore `cafes` collection.
//
//   npm install --save-dev firebase-admin
//   node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json --dry-run
//   node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json
//
// New cafés get zeroed JOLO counters. Existing cafés only have their OSM fields
// refreshed, so ratings, post counts and favorite counts are never overwritten.

import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    file: { type: "string", default: "data/cafes/union-county-nj.json" },
    "service-account": { type: "string", default: process.env.GOOGLE_APPLICATION_CREDENTIALS },
    "dry-run": { type: "boolean", default: false },
  },
});

if (!args["service-account"]) {
  console.error(
    "Missing credentials. Download a key from Firebase console → Project settings → Service accounts,\n" +
      "then pass --service-account <path> or set GOOGLE_APPLICATION_CREDENTIALS."
  );
  process.exit(1);
}

let app, firestore;
try {
  app = await import("firebase-admin/app");
  firestore = await import("firebase-admin/firestore");
} catch {
  console.error("firebase-admin is not installed. Run: npm install --save-dev firebase-admin");
  process.exit(1);
}

const { initializeApp, cert } = app;
const { getFirestore, GeoPoint, FieldValue } = firestore;

const serviceAccount = JSON.parse(await readFile(args["service-account"], "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const seed = JSON.parse(await readFile(args.file, "utf8"));
const collection = db.collection("cafes");

const refs = seed.cafes.map((cafe) => collection.doc(cafe.id));
const snapshots = await db.getAll(...refs);

const COUNTERS = { ratingSum: 0, ratingCount: 0, postCount: 0, favoriteCount: 0 };
const BATCH_LIMIT = 400;
let created = 0;
let updated = 0;
let batch = db.batch();
let pending = 0;

for (const [i, { id, location, ...fields }] of seed.cafes.entries()) {
  const data = {
    ...fields,
    location: new GeoPoint(location.lat, location.lng),
    importedAt: FieldValue.serverTimestamp(),
  };

  if (snapshots[i].exists) {
    // update() replaces each listed top-level field and leaves counters untouched.
    batch.update(refs[i], data);
    updated++;
  } else {
    batch.set(refs[i], { ...data, ...COUNTERS, createdAt: FieldValue.serverTimestamp() });
    created++;
  }

  if (++pending === BATCH_LIMIT) {
    if (!args["dry-run"]) await batch.commit();
    batch = db.batch();
    pending = 0;
  }
}
if (pending > 0 && !args["dry-run"]) await batch.commit();

// Cafés that disappeared from OSM or were excluded are reported, not deleted,
// because posts and favorites may still reference them.
const seedIds = new Set(seed.cafes.map((c) => c.id));
const existingOsm = await collection.where("source", "==", "osm").select().get();
const stale = existingOsm.docs.map((d) => d.id).filter((id) => !seedIds.has(id));

const prefix = args["dry-run"] ? "[dry run] Would have" : "Done:";
console.log(`${prefix} created ${created}, updated ${updated} cafés in project ${serviceAccount.project_id}.`);
if (stale.length > 0) {
  console.log(`\n${stale.length} OSM cafés in Firestore are no longer in ${args.file} (left in place):`);
  for (const id of stale) console.log(`  ${id}`);
}
