import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeDestroy,
} from "sequelize-typescript";

import User from "./user";
import Conversation from "./conversation";
import MessageFiles from "./message_files";
import { deleteFile } from "../../storage";

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
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  conversationId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  userId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => MessageFiles, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  files!: MessageFiles[];

  /**
   * HOOKS
   */

  @BeforeDestroy
  static async deleteFiles(instance: Message, options: any) {
    const messageFiles = await instance.$get("files");

    for (const file of messageFiles) {
      await deleteFile(file.path);
    }
  }
}

export default Message;
