// Centered on Cranford so the whole county fits on screen.
export const UNION_COUNTY_REGION = {
  latitude: 40.662,
  longitude: -74.33,
  latitudeDelta: 0.22,
  longitudeDelta: 0.22,
};

// Beyond this, "0.4 miles away" is meaningless, so the Finder treats the user as
// browsing the county remotely and hides distances.
const SERVICE_RADIUS_MILES = 30;

const EARTH_RADIUS_MILES = 3958.8;
const WALKING_MPH = 3;

const toRadians = (deg) => (deg * Math.PI) / 180;

export function distanceMiles(from, to) {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

export function isInServiceArea(coords) {
  return distanceMiles(coords, UNION_COUNTY_REGION) <= SERVICE_RADIUS_MILES;
}

export function formatDistance(miles) {
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function walkingMinutes(miles) {
  return Math.max(1, Math.round((miles / WALKING_MPH) * 60));
}
