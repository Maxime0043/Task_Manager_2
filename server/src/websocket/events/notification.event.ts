import { Socket } from "socket.io";
import { Op } from "sequelize";

import { io, userSockets } from "../../ws";
import Conversation from "../../db/models/conversation";
import ConversationUsers from "../../db/models/conversation_users";
import ConversationProjects from "../../db/models/conversation_projects";
import ConversationTasks from "../../db/models/conversation_tasks";
import Project from "../../db/models/project";
import Message from "../../db/models/message";
import Task from "../../db/models/task";

export default function (socket: Socket) {
  socket.on("new-notification", async () => {
    const userId = socket.data.userId;
    const conversationId = socket.data.conversationId;

    // Retrieve all the users in the conversation
    const conversation = await Conversation.findByPk(conversationId, {
      include: [ConversationUsers, ConversationProjects, ConversationTasks],
    });

    if (conversation?.conversationUsers) {
      // Emit the event to the users in the conversation
      socket.broadcast.to(conversationId).emit("new-notification");
    } else {
      // Retrieve all the users that have talked in the conversation
      const participants = await Message.findAll({
        where: {
          conversationId,
          userId: { [Op.ne]: userId, [Op.not]: null },
        },
        attributes: ["userId"],
        group: ["userId"],
      });

      const participantIds = participants.map((user) => user.userId);

      // Emit the event to the users
      for (const participantId of participantIds) {
        const socketUser = userSockets[participantId]?.socket;

        if (socketUser) {
          io.to(socketUser).emit("new-notification");
        }
      }

      participantIds.push(userId);

      if (conversation?.conversationProjects) {
        // Retrieve the projectId
        const projectId = conversation.conversationProjects.projectId;

        // Retrieve the manager of the project
        const project = await Project.findByPk(projectId);

        if (project && !participantIds.includes(project.managerId)) {
          // Emit the event to the manager
          const socketManager = userSockets[project.managerId]?.socket;

          if (socketManager) {
            io.to(socketManager).emit("new-notification");
          }
        }
      } else if (conversation?.conversationTasks) {
        // Retrieve the taskId
        const taskId = conversation.conversationTasks.taskId;

        // Retrieve the assignee of the task
        const task = await Task.findByPk(taskId);

        if (task) {
          const userAssignedIds = task.usersAssigned.map(
            (assignee) => assignee.id
          );

          // Emit the event to the users assigned
          for (const userAssignedId of userAssignedIds) {
            const socketUserAssigned = userSockets[userAssignedId]?.socket;

            if (
              socketUserAssigned &&
              !participantIds.includes(userAssignedId)
            ) {
              io.to(socketUserAssigned).emit("new-notification");
            }
          }
        }
      }
    }
  });
}
