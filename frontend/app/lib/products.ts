import { cache } from "react";
import { getPhoneBySlug, getEarbudBySlug, getVehicleBySlug } from "./api";

export const getProductVehicleBySlug = cache(getVehicleBySlug);
export const getProductEarbudBySlug = cache(getEarbudBySlug);

// A single request shares this lookup between metadata and the page render.
// A backend error is allowed to throw; it must not turn into a false 404.
export const resolveProduct = cache(async (slug: string) => {
  const phone = await getPhoneBySlug(slug);
  if (phone) return { type: "phone" as const, data: phone };

  const earbud = await getProductEarbudBySlug(slug);
  if (earbud) return { type: "earbud" as const, data: earbud };

  const vehicle = await getProductVehicleBySlug(slug);
  if (vehicle?.vehicle) return { type: "vehicle" as const, data: vehicle.vehicle };

  return null;
});
