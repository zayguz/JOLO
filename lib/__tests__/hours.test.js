import { getOpenStatus } from "@/lib/hours";

// 2026-10-23 is a Friday; New Jersey is on EDT (UTC-4) that week.
const fridayAt = (hhmm) => new Date(`2026-10-23T${hhmm}:00-04:00`);

const weekdays = {
  mo: [{ open: "07:00", close: "18:00" }],
  fr: [{ open: "07:00", close: "18:00" }],
  sa: [{ open: "08:30", close: "14:00" }],
};

describe("getOpenStatus", () => {
  it("returns null when hours are unknown", () => {
    expect(getOpenStatus(null)).toBeNull();
    expect(getOpenStatus(undefined)).toBeNull();
  });

  it("reports when an open café closes", () => {
    expect(getOpenStatus(weekdays, fridayAt("10:00"))).toEqual({
      isOpen: true,
      label: "Open until 6 PM",
    });
  });

  it("treats the closing minute as closed", () => {
    expect(getOpenStatus(weekdays, fridayAt("18:00")).isOpen).toBe(false);
  });

  it("reports a later opening the same day", () => {
    expect(getOpenStatus(weekdays, fridayAt("06:00"))).toEqual({
      isOpen: false,
      label: "Opens at 7 AM",
    });
  });

  it("reports tomorrow's opening with minutes", () => {
    expect(getOpenStatus(weekdays, fridayAt("19:00")).label).toBe("Opens tomorrow at 8:30 AM");
  });

  it("names the day when the next opening is further out", () => {
    const mondaysOnly = { mo: weekdays.mo };
    expect(getOpenStatus(mondaysOnly, fridayAt("19:00")).label).toBe("Opens Mon at 7 AM");
  });

  it("keeps an overnight range from yesterday open past midnight", () => {
    const lateThursday = { th: [{ open: "18:00", close: "02:00" }] };
    expect(getOpenStatus(lateThursday, fridayAt("01:00"))).toEqual({
      isOpen: true,
      label: "Open until 2 AM",
    });
  });

  it("recognizes 24-hour days", () => {
    const allDay = { fr: [{ open: "00:00", close: "00:00" }] };
    expect(getOpenStatus(allDay, fridayAt("03:00")).label).toBe("Open 24 hours");
  });

  it("labels a close at midnight", () => {
    const evenings = { fr: [{ open: "20:00", close: "00:00" }] };
    expect(getOpenStatus(evenings, fridayAt("21:00")).label).toBe("Open until midnight");
  });

  it("evaluates in New Jersey time regardless of the UTC date", () => {
    // 03:30 UTC Saturday is still 23:30 Friday in New Jersey.
    const evenings = { fr: [{ open: "20:00", close: "00:00" }] };
    expect(getOpenStatus(evenings, new Date("2026-10-24T03:30:00Z")).isOpen).toBe(true);
  });

  it("says closed when there are no hours on any day", () => {
    expect(getOpenStatus({}, fridayAt("10:00"))).toEqual({ isOpen: false, label: "Closed" });
  });
});
