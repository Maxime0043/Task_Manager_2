import { Table, Column, Model, DataType, HasOne } from "sequelize-typescript";
import ConversationUsers from "./conversation_users";
import ConversationProjects from "./conversation_projects";
import ConversationTasks from "./conversation_tasks";

export const CONVERSATION_TYPE = {
  USER: "user",
  PROJECT: "project",
  TASK: "task",
};

@Table({
  modelName: "Conversation",
  timestamps: false,
})
class Conversation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.ENUM(...Object.values(CONVERSATION_TYPE)),
    allowNull: false,
  })
  type!: string;

  /**
   * ASSOCIATIONS
   */

  @HasOne(() => ConversationUsers)
  conversationUsers!: ConversationUsers;

  @HasOne(() => ConversationProjects)
  conversationProjects!: ConversationProjects;

  @HasOne(() => ConversationTasks)
  conversationTasks!: ConversationTasks;
}

export default Conversation;
