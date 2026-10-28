import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { SAVED_CARD_CHARGES, buildLineItems } from "./catalog.ts";

Deno.test("Starter LLC is $149 at checkout; the $125 state fee is charged later", () => {
  const r = buildLineItems("starter", "llc", []);
  assertEquals([r.totalCents, r.stateFeeCents], [14900, 12500]);
});

Deno.test("International+ corporation is $449 at checkout; $70 state fee later", () => {
  const r = buildLineItems("international", "corp", []);
  assertEquals([r.totalCents, r.stateFeeCents], [44900, 7000]);
});

Deno.test("Extras already included in the plan are not charged again", () => {
  assertEquals(buildLineItems("professional", "llc", ["ein", "expedited"]).totalCents, 24900);
});

Deno.test("Annual report adds $119 at checkout and the annual report fee to the later state charge", () => {
  const r = buildLineItems("starter", "llc", ["annual_report"]);
  assertEquals([r.totalCents, r.stateFeeCents], [14900 + 11900, 12500 + 13875]);
});

Deno.test("Starter extras: EIN $99 and expedited $69", () => {
  assertEquals(buildLineItems("starter", "llc", ["ein", "expedited"]).totalCents, 14900 + 9900 + 6900);
});

Deno.test("Business + Website LLC is $1,199 at checkout, with EIN and expedited included", () => {
  assertEquals(buildLineItems("business_website", "llc", ["ein", "expedited"]).totalCents, 119900);
});

Deno.test("Saved-card charges match the order's state fee and yearly renewals", () => {
  assertEquals(SAVED_CARD_CHARGES.state_fee.cents("llc", []), 12500);
  assertEquals(SAVED_CARD_CHARGES.state_fee.cents("corp", ["annual_report"]), 7000 + 15000);
  assertEquals(SAVED_CARD_CHARGES.annual_report_renewal.cents("llc", []), 11900 + 13875);
  assertEquals(SAVED_CARD_CHARGES.registered_agent_renewal.cents("corp", []), 11900);
});
