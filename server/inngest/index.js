import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Inngest client
export const inngest = new Inngest({
  id: "my-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// User Created
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-created" },
  { event: "clerk/user.created" },
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
  { event: "clerk/user.updated" },
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
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.deleteMany({
      where: { clerkId: data.id },
    });

    return { success: true };
  }
);

//Inngest Function To Save WorkSpace data to database
const syncWorkSpaceCreation = inngest.createFunction(
  {id: 'sync-workspace-from-clerk'},
  {event: 'clerk/organization.created'},
  async({event}) =>{
    const{data} = event;
    await prisma.workspace.create({
      data:{
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      }
    })

    //Add Creatore as ADMIN member
    await prisma.workspaceMember.create({
      data:{
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN"
      }
    })
  }
)

//Inngest Function to update workspace data in database
const syncWorkSpaceUpdation = inngest.createFunction(
  {id: 'update-workspace-from-clerk'},
  {event: 'clerk/organization.updated'},
  async({event}) =>{
    const {data} = event;
    await prisma.workspace.update({
      where:{
        id: data.id
      },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url
      }
    })
  }
)

//Inngest Function to delete workspace data in database
const syncWorkSpaceDeletion = inngest.createFunction(
  {id: 'delete-workspace-with-clerk'},
  {event: 'clerk/organization.deleted'},
  async({event}) =>{
    const{data} = event;
    await prisma.workspace.delete({
      where:{
        id: data.id
      }
    })
  }
)

// Inngest function to save workspace member data to a database
const syncworkspaceMemberCreation = inngest.createFunction(
  {id: 'sync-workspace-member-from-clerk'},
  {event: 'clerk/organizationInvitation.accepted'},
  async ({event}) => {
    const {data} = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      }
    })
  }
)

export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
  syncWorkSpaceCreation,
  syncWorkSpaceUpdation,
  syncWorkSpaceDeletion,
  syncworkspaceMemberCreation
];