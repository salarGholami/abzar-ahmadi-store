import test from "node:test";
import assert from "node:assert/strict";

const transitions = {
  PENDING_PAYMENT: ["PAYMENT_REVIEW", "PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_REVIEW: ["PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURN_REQUESTED"],
  DELIVERED: ["RETURN_REQUESTED"],
  CANCELLED: [], PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"], RETURN_REQUESTED: ["RETURNED", "DELIVERED"], RETURNED: ["REFUNDED"], REFUNDED: []
};
const can = (a,b) => a === b || transitions[a].includes(b);

test("order lifecycle rejects impossible transitions", () => {
  assert.equal(can("PENDING_PAYMENT", "PAID"), true);
  assert.equal(can("DELIVERED", "RETURN_REQUESTED"), true);
  assert.equal(can("DELIVERED", "PROCESSING"), false);
  assert.equal(can("REFUNDED", "PAID"), false);
});

test("inventory availability respects active reservations", () => {
  const stock=10, active=[{quantity:3,status:"ACTIVE"},{quantity:2,status:"CONSUMED"}];
  const reserved=active.filter(x=>x.status==="ACTIVE").reduce((a,x)=>a+x.quantity,0);
  assert.equal(stock-reserved,7);
  assert.equal(stock-reserved>=8,false);
});
