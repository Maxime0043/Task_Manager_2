import UserRoles from "../db/models/user_role";
import ProjectStatus from "../db/models/project_status";
import TaskStatus from "../db/models/task_status";
import Client from "../db/models/client";

export default async function initDB() {
  // Create the UserRoles
  await UserRoles.bulkCreate([
    {
      id: 1,
      name: "developer",
      label: "Developer",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "graphic_designer",
      label: "Graphic Designer",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "project_manager",
      label: "Project Manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create the ProjectStatus
  await ProjectStatus.bulkCreate([
    {
      id: 1,
      name: "not_started",
      label: "Not Started",
      color: "#FF0000",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "in_progress",
      label: "In Progress",
      color: "#00FF00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "completed",
      label: "Completed",
      color: "#0000FF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: "on_hold",
      label: "On Hold",
      color: "#FFFF00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: "discontinued",
      label: "Discontinued",
      color: "#FF00FF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create the TaskStatus
  await TaskStatus.bulkCreate([
    {
      id: 1,
      name: "not_started",
      label: "Not Started",
      color: "#FF0000",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "in_progress",
      label: "In Progress",
      color: "#00FF00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "completed",
      label: "Completed",
      color: "#0000FF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: "on_hold",
      label: "On Hold",
      color: "#FFFF00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: "discontinued",
      label: "Discontinued",
      color: "#FF00FF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function populateClients(creatorId: string) {
  // Create the clients
  const clients: any = [];

  for (let i = 1; i <= 20; i++) {
    clients.push({
      name: `Client ${i}`,
      email: `client${i}@example.com`,
      description: `Description of the client ${i}`,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await Client.bulkCreate(clients);
}
