// Turns a café's weekly `hours` (see scripts/cafes/opening-hours.mjs) into a
// status line like "Open until 8 PM". Times are evaluated in New Jersey time so
// the label is right even when viewing from another time zone.

const DAY_KEYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MINUTES_PER_DAY = 24 * 60;

function nowInNewJersey(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(date);
    const value = (type) => parts.find((p) => p.type === type)?.value;
    const day = DAY_NAMES.indexOf(value("weekday"));
    if (day === -1) throw new Error("Unexpected weekday");
    return { day, minutes: (Number(value("hour")) % 24) * 60 + Number(value("minute")) };
  } catch {
    return { day: date.getDay(), minutes: date.getHours() * 60 + date.getMinutes() };
  }
}

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Normalizes a range so `end` is after `start`, pushing overnight closes into the next day.
function span({ open, close }) {
  const start = toMinutes(open);
  let end = toMinutes(close);
  if (end <= start) end += MINUTES_PER_DAY;
  return { start, end };
}

function formatTime(minutes) {
  const normalized = minutes % MINUTES_PER_DAY;
  if (normalized === 0) return "midnight";
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * @returns {{ isOpen: boolean, label: string } | null} null when hours are unknown.
 */
export function getOpenStatus(hours, date = new Date()) {
  if (!hours) return null;
  const { day, minutes } = nowInNewJersey(date);
  const today = hours[DAY_KEYS[day]] ?? [];
  const yesterday = hours[DAY_KEYS[(day + 6) % 7]] ?? [];

  for (const range of today) {
    const { start, end } = span(range);
    if (start === 0 && end === MINUTES_PER_DAY) return { isOpen: true, label: "Open 24 hours" };
    if (minutes >= start && minutes < end) {
      return { isOpen: true, label: `Open until ${formatTime(end)}` };
    }
  }

  // A range like Fri 18:00-02:00 is still open early Saturday morning.
  for (const range of yesterday) {
    const { end } = span(range);
    if (end > MINUTES_PER_DAY && minutes < end - MINUTES_PER_DAY) {
      return { isOpen: true, label: `Open until ${formatTime(end)}` };
    }
  }

  const laterToday = today.map(span).filter(({ start }) => start > minutes);
  if (laterToday.length > 0) {
    const next = Math.min(...laterToday.map((r) => r.start));
    return { isOpen: false, label: `Opens at ${formatTime(next)}` };
  }

  for (let offset = 1; offset <= 7; offset++) {
    const dayIndex = (day + offset) % 7;
    const ranges = hours[DAY_KEYS[dayIndex]] ?? [];
    if (ranges.length === 0) continue;
    const next = Math.min(...ranges.map((r) => span(r).start));
    const when = offset === 1 ? "tomorrow" : DAY_NAMES[dayIndex];
    return { isOpen: false, label: `Opens ${when} at ${formatTime(next)}` };
  }

  return { isOpen: false, label: "Closed" };
}
