import { describe, expect, it } from "vitest";
import { estimateOrderPriceCents, isAfterHours } from "@targets/shared";

// Pure rate-card math (no DB). Base = vehicle type; only 4-Hour Rush adds a
// surcharge; extra weight is $10/10 lbs over the vehicle's limit; after-hours
// applies a +25% premium.
describe("estimateOrderPriceCents", () => {
  it("uses the vehicle type for the base rate", () => {
    expect(estimateOrderPriceCents({ vehicleType: "CAR", serviceLevel: "SAME_DAY" })).toBe(2500);
    expect(estimateOrderPriceCents({ vehicleType: "MINI_VAN", serviceLevel: "SAME_DAY" })).toBe(5500);
    expect(estimateOrderPriceCents({ vehicleType: "CARGO_VAN", serviceLevel: "SAME_DAY" })).toBe(12000);
  });

  it("returns 0 when no priced vehicle is selected", () => {
    expect(estimateOrderPriceCents({ serviceLevel: "SAME_DAY" })).toBe(0);
    expect(estimateOrderPriceCents({ vehicleType: "OTHER", serviceLevel: "SAME_DAY" })).toBe(0);
  });

  it("charges the same base rate for every service level except 4 Hours", () => {
    for (const level of ["SAME_DAY", "NEXT_DAY", "HOT_RUSH", "CRITICAL"] as const) {
      expect(estimateOrderPriceCents({ vehicleType: "CAR", serviceLevel: level })).toBe(2500);
    }
    expect(estimateOrderPriceCents({ vehicleType: "CAR", serviceLevel: "FOUR_HOURS" })).toBe(4500);
  });

  it("adds $10 per 10 lbs (or part) over the vehicle's weight limit", () => {
    // Car limit is 40 lbs. 50 kg ≈ 110.23 lbs → 70.23 over → ceil(70.23/10)=8 → +$80.
    expect(estimateOrderPriceCents({ vehicleType: "CAR", weightKg: 50, serviceLevel: "SAME_DAY" })).toBe(10500);
    // Under the limit adds nothing.
    expect(estimateOrderPriceCents({ vehicleType: "CARGO_VAN", weightKg: 100, serviceLevel: "SAME_DAY" })).toBe(12000);
  });

  it("applies the +25% after-hours premium last", () => {
    // Saturday → after hours regardless of time.
    expect(
      estimateOrderPriceCents({ vehicleType: "CAR", serviceLevel: "SAME_DAY", pickupDate: "2026-09-12" }),
    ).toBe(3125);
    // Weekday within business hours → no premium.
    expect(
      estimateOrderPriceCents({
        vehicleType: "CAR",
        serviceLevel: "SAME_DAY",
        pickupDate: "2026-09-10",
        pickupTime: "10:00",
      }),
    ).toBe(2500);
    // Weekday after 18:00 → premium.
    expect(
      estimateOrderPriceCents({
        vehicleType: "CAR",
        serviceLevel: "SAME_DAY",
        pickupDate: "2026-09-10",
        pickupTime: "19:00",
      }),
    ).toBe(3125);
  });
});

describe("isAfterHours", () => {
  it("treats weekends as after hours", () => {
    expect(isAfterHours("2026-09-12")).toBe(true); // Saturday
  });

  it("treats weekday business hours as within hours", () => {
    expect(isAfterHours("2026-09-14", "09:00")).toBe(false); // Monday 9am
    expect(isAfterHours("2026-09-14", "17:59")).toBe(false);
  });

  it("treats early mornings and evenings as after hours", () => {
    expect(isAfterHours("2026-09-14", "07:59")).toBe(true);
    expect(isAfterHours("2026-09-14", "18:00")).toBe(true);
  });

  it("assumes within hours when the date or time is missing", () => {
    expect(isAfterHours()).toBe(false);
    expect(isAfterHours("2026-09-14")).toBe(false); // weekday, no time
  });
});
