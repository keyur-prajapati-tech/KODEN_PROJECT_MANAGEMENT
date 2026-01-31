import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Inngest client
export const inngest = new Inngest({
  id: "project-management-server",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// User Created
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-created" },
  { event: "user.created" },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.create({
      data: {
        clerkId: data.id,
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`,
        image: data?.image_url,
      },
    });

    return { success: true };
  }
);

// User Updated
const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-updated" },
  { event: "user.updated" },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: {
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`,
        image: data?.image_url,
      },
    });

    return { success: true };
  }
);

// User Deleted
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deleted" },
  { event: "user.deleted" },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.deleteMany({
      where: { clerkId: data.id },
    });

    return { success: true };
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
];