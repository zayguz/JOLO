import {
  UNION_COUNTY_REGION,
  distanceMiles,
  formatDistance,
  isInServiceArea,
  walkingMinutes,
} from "@/lib/geo";

describe("distanceMiles", () => {
  it("is zero for the same point", () => {
    expect(distanceMiles(UNION_COUNTY_REGION, UNION_COUNTY_REGION)).toBe(0);
  });

  it("measures one degree of latitude as about 69 miles", () => {
    const from = { latitude: 40, longitude: -74 };
    const to = { latitude: 41, longitude: -74 };
    expect(distanceMiles(from, to)).toBeCloseTo(69.09, 1);
  });
});

describe("isInServiceArea", () => {
  it("includes the county and nearby towns", () => {
    expect(isInServiceArea({ latitude: 40.6639, longitude: -74.2107 })).toBe(true); // Elizabeth
  });

  it("excludes users far away", () => {
    expect(isInServiceArea({ latitude: 39.9526, longitude: -75.1652 })).toBe(false); // Philadelphia
  });
});

describe("formatDistance", () => {
  it.each([
    [0.05, "< 0.1 mi"],
    [0.1, "0.1 mi"],
    [2.345, "2.3 mi"],
    [9.94, "9.9 mi"],
    [12.6, "13 mi"],
  ])("formats %p miles as %p", (miles, expected) => {
    expect(formatDistance(miles)).toBe(expected);
  });
});

describe("walkingMinutes", () => {
  it("assumes 3 mph", () => {
    expect(walkingMinutes(1.5)).toBe(30);
  });

  it("never shows less than a minute", () => {
    expect(walkingMinutes(0)).toBe(1);
  });
});
