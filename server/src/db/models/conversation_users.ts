import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from "sequelize-typescript";

import User from "./user";
import Conversation from "./conversation";

@Table({
  modelName: "ConversationUsers",
  tableName: "ConversationUsers",
  timestamps: false,
})
class ConversationUsers extends Model {
  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  aUserId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bUserId!: string;

  /**
   * ASSOCIATIONS
   */

  // Add associations here
}

export default ConversationUsers;
