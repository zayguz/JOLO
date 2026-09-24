// Step 1: download coffee shops for one county from OpenStreetMap and write a
// reviewable JSON seed file. Run from the project root:
//
//   node scripts/cafes/fetch-osm-cafes.mjs
//   node scripts/cafes/fetch-osm-cafes.mjs --relation 957236 --slug union-county-nj
//
// Manual fixes go in data/cafes/overrides.json and are re-applied on every run.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { parseOpeningHours } from "./opening-hours.mjs";

const { values: args } = parseArgs({
  options: {
    // OSM relation for the county boundary. 957236 = Union County, New Jersey.
    relation: { type: "string", default: "957236" },
    slug: { type: "string", default: "union-county-nj" },
    label: { type: "string", default: "Union County, NJ" },
  },
});

const OVERPASS_URL = process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";
const USER_AGENT = "JOLO-portfolio-app/1.0 (cafe seed import)";
const OUTPUT_PATH = `data/cafes/${args.slug}.json`;
const OVERRIDES_PATH = "data/cafes/overrides.json";

// Overpass area IDs are the relation ID offset by 3600000000.
const areaId = 3600000000 + Number(args.relation);

// For each café, also return the municipality (admin_level 8) it sits in,
// since about a third of OSM entries have no addr:city.
const query = `
[out:json][timeout:120];
area(${areaId})->.county;
(
  nwr["amenity"="cafe"](area.county);
  nwr["amenity"="fast_food"]["cuisine"~"coffee_shop"](area.county);
  nwr["shop"="coffee"](area.county);
)->.cafes;
foreach.cafes->.c(
  .c out center tags;
  node(w.c)->.wayNodes;
  (.c; .wayNodes;)->.points;
  node.points->.pointNodes;
  .pointNodes is_in->.areas;
  area.areas["boundary"="administrative"]["admin_level"="8"];
  out tags;
);`;

async function fetchOverpass() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: query }),
    });
    if (response.ok) return response.json();
    if (attempt < 3 && [429, 502, 503, 504].includes(response.status)) {
      console.warn(`Overpass returned ${response.status}, retrying in ${attempt * 15}s...`);
      await new Promise((r) => setTimeout(r, attempt * 15_000));
      continue;
    }
    throw new Error(`Overpass request failed: ${response.status} ${await response.text()}`);
  }
}

// The foreach output is a flat list: a café element followed by its areas.
function groupWithMunicipality(elements) {
  const results = [];
  for (const element of elements) {
    if (element.type === "area") {
      const current = results.at(-1);
      if (current && !current.municipality) current.municipality = element.tags?.name ?? null;
    } else {
      results.push({ element, municipality: null });
    }
  }
  return results;
}

function yesNo(value) {
  if (value === undefined) return null;
  return value !== "no";
}

function formatAddress(tags, municipality) {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  if (!street) return null;
  const city = tags["addr:city"] ?? municipality;
  const stateZip = [tags["addr:state"] ?? "NJ", tags["addr:postcode"]].filter(Boolean).join(" ");
  return [street, city, stateZip].filter(Boolean).join(", ");
}

function normalize({ element, municipality }) {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const hoursRaw = tags.opening_hours ?? null;

  return {
    // Firestore document IDs cannot contain "/", so osmId "node/123" becomes "osm-node-123".
    id: `osm-${element.type}-${element.id}`,
    source: "osm",
    osmId: `${element.type}/${element.id}`,
    name: tags.name,
    nameLower: tags.name.toLowerCase(),
    brand: tags.brand ?? null,
    isChain: Boolean(tags.brand || tags["brand:wikidata"]),
    address: formatAddress(tags, municipality),
    municipality,
    location: { lat, lng },
    hours: parseOpeningHours(hoursRaw),
    hoursRaw,
    website: tags.website ?? tags["contact:website"] ?? null,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    amenities: {
      wifi: tags.internet_access ? !["no", "terminal"].includes(tags.internet_access) : null,
      outdoorSeating: yesNo(tags.outdoor_seating),
      driveThrough: yesNo(tags.drive_through),
    },
  };
}

async function readOverrides() {
  try {
    return JSON.parse(await readFile(OVERRIDES_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function applyOverrides(cafes, overrides) {
  return cafes.flatMap((cafe) => {
    const { exclude, reason, ...override } = overrides[cafe.id] ?? {};
    if (exclude) return [];
    if (Object.keys(override).length === 0) return [cafe];
    const merged = { ...cafe, ...override };
    if ("hoursRaw" in override && !("hours" in override)) {
      merged.hours = parseOpeningHours(override.hoursRaw);
    }
    if ("name" in override) merged.nameLower = override.name.toLowerCase();
    return [merged];
  });
}

const data = await fetchOverpass();
const overrides = await readOverrides();

const named = groupWithMunicipality(data.elements).filter(({ element }) => element.tags?.name);
const cafes = applyOverrides(named.map(normalize), overrides).sort(
  (a, b) => (a.municipality ?? "").localeCompare(b.municipality ?? "") || a.name.localeCompare(b.name)
);

await mkdir("data/cafes", { recursive: true });
await writeFile(
  OUTPUT_PATH,
  JSON.stringify(
    {
      area: args.label,
      osmRelation: Number(args.relation),
      source: "OpenStreetMap via Overpass API",
      license: "ODbL-1.0",
      attribution: "© OpenStreetMap contributors",
      fetchedAt: new Date().toISOString(),
      count: cafes.length,
      cafes,
    },
    null,
    2
  ) + "\n"
);

const missingHours = cafes.filter((c) => !c.hoursRaw);
const unparsedHours = cafes.filter((c) => c.hoursRaw && !c.hours);
const missingAddress = cafes.filter((c) => !c.address);

console.log(`Wrote ${cafes.length} cafés to ${OUTPUT_PATH}`);
console.log(`  independent: ${cafes.filter((c) => !c.isChain).length}, chains: ${cafes.filter((c) => c.isChain).length}`);
console.log(`  skipped unnamed: ${data.elements.filter((e) => e.type !== "area" && !e.tags?.name).length}`);
console.log(`  excluded by overrides: ${named.length - cafes.length}`);

const list = (label, items, detail = () => "") => {
  if (items.length === 0) return;
  console.log(`\n${label} (${items.length}):`);
  for (const c of items) console.log(`  ${c.id.padEnd(22)} ${c.name} — ${c.municipality}${detail(c)}`);
};
list("Unparseable hours, fix via hoursRaw in overrides.json", unparsedHours, (c) => ` [${c.hoursRaw}]`);
list("Independent cafés missing hours", missingHours.filter((c) => !c.isChain));
list("Independent cafés missing a street address", missingAddress.filter((c) => !c.isChain));
