import type { OrderStatus } from "./types";

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ["PAYMENT_REVIEW", "PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_REVIEW: ["PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURN_REQUESTED"],
  DELIVERED: ["RETURN_REQUESTED"],
  CANCELLED: [],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return from === to || transitions[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransition(from, to)) throw new Error("INVALID_ORDER_TRANSITION");
}

export function orderStatusFromPayment(paymentStatus: string): OrderStatus {
  switch (paymentStatus) {
    case "PAID": return "PAID";
    case "CANCELED": return "CANCELLED";
    case "PENDING_TRANSFER": return "PAYMENT_REVIEW";
    case "PENDING_PAYMENT": return "PENDING_PAYMENT";
    default: return "PENDING_PAYMENT";
  }
}
