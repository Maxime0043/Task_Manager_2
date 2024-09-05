import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import User from "./user";
import Conversation from "./conversation";

@Table({
  modelName: "Message",
})
class Message extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, allowNull: false })
  conversationId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => User)
  user!: User;
}

export default Message;
