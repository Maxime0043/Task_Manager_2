import UserRoles from "../db/models/user_role";
import ProjectStatus from "../db/models/project_status";
import TaskStatus from "../db/models/task_status";
import Client from "../db/models/client";
import Project from "../db/models/project";
import Task from "../db/models/task";
import TaskScheduled from "../db/models/task_scheduled";

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

export async function populateUserRoles() {
  // Create the userRoles
  const userRoles: any = [];

  for (let i = 1; i <= 20; i++) {
    userRoles.push({
      name: `role ${i}`,
      label: `Role ${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await UserRoles.bulkCreate(userRoles);
}

export async function populateProjectStatus() {
  // Create the projectStatus
  const projectStatus: any = [];

  for (let i = 1; i <= 20; i++) {
    projectStatus.push({
      name: `status ${i}`,
      label: `Status ${i}`,
      color: "#FF0000",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await ProjectStatus.bulkCreate(projectStatus);
}

export async function populateTaskStatus() {
  // Create the taskStatus
  const taskStatus: any = [];

  for (let i = 1; i <= 20; i++) {
    taskStatus.push({
      name: `status ${i}`,
      label: `Status ${i}`,
      color: "#FF0000",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await TaskStatus.bulkCreate(taskStatus);
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

export async function populateProjects(creatorId: string, clientId: string) {
  // Create the projects
  const projects: any = [];

  for (let i = 1; i <= 20; i++) {
    projects.push({
      name: `Project ${i}`,
      statusId: 1,
      budget: Math.floor(Math.random() * 100000),
      description: `Description of the project ${i}`,
      isInternalProject: Math.random() >= 0.5,
      managerId: creatorId,
      clientId,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await Project.bulkCreate(projects);
}

export async function populateTasks(creatorId: string, projectId: string) {
  // Create the tasks
  const tasks: any = [];

  for (let i = 1; i <= 20; i++) {
    tasks.push({
      name: `Task ${i}`,
      timeEstimate: "16.00",
      deadline: "2024-09-12 09:30:00",
      percentDone: 0,
      statusId: 1,
      description: `Description of the task ${i}`,
      priority: "high",
      position: 1,
      projectId,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await Task.bulkCreate(tasks);
}

export async function populateTaskScheduled(userId: string, projectId: string) {
  // Create the taskScheduled
  const taskScheduled: any = [];

  for (let i = 1; i <= 20; i++) {
    taskScheduled.push({
      date: `2024-09-${("00" + i).slice(-2)}`,
      start: "08:00:00",
      end: "12:00:00",
      taskId: null,
      projectId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await TaskScheduled.bulkCreate(taskScheduled);
}
