import "server-only";

import { requireSession } from "./support-auth";

import { supportMessageRepo, supportTicketRepo } from "./repositories";

import type { SupportTicket } from "./types";

/* -------------------------------------------------------------------------- */
/* Create Ticket                                                               */
/* -------------------------------------------------------------------------- */

export async function createTicket(
  input: Pick<
    SupportTicket,
    "subject" | "category" | "priority" | "orderId"
  > & {
    body: string;
    attachmentUrl?: string | null;
  },
) {
  const session = await requireSession();

  const subject = input.subject.trim().slice(0, 160);

  const body = input.body.trim().slice(0, 5000);

  if (!subject) {
    throw new Error("SUBJECT_REQUIRED");
  }

  if (!body) {
    throw new Error("MESSAGE_REQUIRED");
  }

  const ticket = await supportTicketRepo.create({
    userId: session.id,

    subject,

    category: input.category,

    priority: input.priority,

    status: "OPEN",

    orderId: input.orderId ?? null,

    assignedTo: null,
  });

  await supportMessageRepo.create({
    ticketId: ticket.id,

    senderId: session.id,

    senderRole: session.role,

    body,

    attachmentUrl: input.attachmentUrl ?? null,
  });

  return ticket;
}

/* -------------------------------------------------------------------------- */
/* List Tickets                                                               */
/* -------------------------------------------------------------------------- */

export async function listTickets() {
  const session = await requireSession();

  const tickets = await supportTicketRepo.all();

  if (session.role === "ADMIN") {
    return tickets;
  }

  return tickets.filter((ticket) => ticket.userId === session.id);
}

/* -------------------------------------------------------------------------- */
/* Reply                                                                      */
/* -------------------------------------------------------------------------- */

export async function replyTicket(
  ticketId: string,
  body: string,
  attachmentUrl?: string | null,
) {
  const session = await requireSession();

  const ticket = await supportTicketRepo.find(ticketId);

  if (!ticket) {
    throw new Error("NOT_FOUND");
  }

  const canAccess = session.role === "ADMIN" || ticket.userId === session.id;

  if (!canAccess) {
    throw new Error("NOT_FOUND");
  }

  const messageBody = body.trim().slice(0, 5000);

  if (!messageBody) {
    throw new Error("MESSAGE_REQUIRED");
  }

  const message = await supportMessageRepo.create({
    ticketId,

    senderId: session.id,

    senderRole: session.role,

    body: messageBody,

    attachmentUrl: attachmentUrl ?? null,
  });

  await supportTicketRepo.update(ticketId, {
    status: session.role === "ADMIN" ? "WAITING_FOR_CUSTOMER" : "OPEN",
  });

  return message;
}

/* -------------------------------------------------------------------------- */
/* Get Ticket                                                                 */
/* -------------------------------------------------------------------------- */

export async function getTicket(ticketId: string) {
  const session = await requireSession();

  const ticket = await supportTicketRepo.find(ticketId);

  if (!ticket) {
    throw new Error("NOT_FOUND");
  }

  const canAccess = session.role === "ADMIN" || ticket.userId === session.id;

  if (!canAccess) {
    throw new Error("NOT_FOUND");
  }

  const messages = await supportMessageRepo.all();

  const ticketMessages = messages
    .filter((message) => message.ticketId === ticketId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    ticket,
    messages: ticketMessages,
  };
}
