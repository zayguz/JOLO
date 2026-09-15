// Parses the common subset of OSM `opening_hours` syntax into a weekly schedule.
// Spec: https://wiki.openstreetmap.org/wiki/Key:opening_hours
//
// Supported: "24/7", "05:00-19:00", "Mo-Fr 07:00-19:00; Sa,Su 08:00-17:00",
// "Mo off", split shifts ("08:00-12:00,13:00-17:00"), wrap-around day ranges ("Fr-Mo").
// Holiday rules ("PH off") are ignored. Anything else (months, sunrise, comments,
// "||" fallbacks) returns null so the raw string can be fixed by hand in overrides.json.

export const DAYS = ["mo", "tu", "we", "th", "fr", "sa", "su"];

const RULE = /^(?:(?<days>[A-Z][a-z](?:\s*[-,]\s*[A-Z][a-z])*)\s+)?(?<times>.+)$/;
const RANGE = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\+?$/;

/**
 * @param {string | undefined | null} raw
 * @returns {Record<string, {open: string, close: string}[]> | null}
 *   Every day key is present; an empty array means closed. A `close` earlier than
 *   `open` (e.g. 18:00-02:00) runs past midnight. Returns null if unparseable.
 */
export function parseOpeningHours(raw) {
  if (!raw || !raw.trim()) return null;
  const value = raw.trim();

  if (value === "24/7") {
    return Object.fromEntries(DAYS.map((d) => [d, [{ open: "00:00", close: "24:00" }]]));
  }

  // Days not mentioned by any rule are closed, per the OSM spec.
  const week = Object.fromEntries(DAYS.map((d) => [d, []]));

  for (const rule of value.split(";").map((r) => r.trim()).filter(Boolean)) {
    if (/^(PH|SH)\b/.test(rule)) continue;

    const match = rule.match(RULE);
    if (!match) return null;

    const days = match.groups.days ? expandDays(match.groups.days) : DAYS;
    const ranges = parseTimes(match.groups.times.trim());
    if (!days || !ranges) return null;

    for (const day of days) week[day] = ranges;
  }

  return week;
}

function expandDays(selector) {
  const result = [];
  for (const part of selector.split(",").map((p) => p.trim())) {
    const [start, end] = part.split("-").map((d) => DAYS.indexOf(d.trim().toLowerCase()));
    if (start === -1 || end === -1) return null;
    if (end === undefined) {
      result.push(DAYS[start]);
      continue;
    }
    for (let i = start; ; i = (i + 1) % 7) {
      result.push(DAYS[i]);
      if (i === end) break;
    }
  }
  return result;
}

function parseTimes(times) {
  if (times === "off" || times === "closed") return [];

  const ranges = [];
  for (const part of times.split(",").map((p) => p.trim())) {
    const m = part.match(RANGE);
    if (!m) return null;
    const [, oh, om, ch, cm] = m;
    if (Number(oh) > 24 || Number(ch) > 24 || Number(om) > 59 || Number(cm) > 59) return null;
    ranges.push({ open: `${oh.padStart(2, "0")}:${om}`, close: `${ch.padStart(2, "0")}:${cm}` });
  }
  return ranges;
}
