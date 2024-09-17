import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  HasMany,
} from "sequelize-typescript";

import ConversationUsers from "./conversation_users";
import ConversationProjects from "./conversation_projects";
import ConversationTasks from "./conversation_tasks";
import Message from "./message";

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

  @HasOne(() => ConversationUsers, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  conversationUsers!: ConversationUsers;

  @HasOne(() => ConversationProjects, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  conversationProjects!: ConversationProjects;

  @HasOne(() => ConversationTasks, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  conversationTasks!: ConversationTasks;

  @HasMany(() => Message, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  messages!: Message[];
}

export default Conversation;
