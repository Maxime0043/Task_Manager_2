import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import Project from "./project";
import Conversation from "./conversation";

@Table({
  modelName: "ConversationProjects",
  tableName: "ConversationProjects",
  timestamps: false,
})
class ConversationProjects extends Model {
  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  projectId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => Project)
  project!: Project;
}

export default ConversationProjects;
