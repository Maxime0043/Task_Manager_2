import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import Task from "./task";
import Conversation from "./conversation";

@Table({
  modelName: "ConversationTasks",
  tableName: "ConversationTasks",
  timestamps: false,
})
class ConversationTasks extends Model {
  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  taskId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => Task)
  task!: Task;
}

export default ConversationTasks;
