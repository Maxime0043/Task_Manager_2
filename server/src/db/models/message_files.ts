import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import Message from "./message";

@Table({
  modelName: "MessageFiles",
  tableName: "MessageFiles",
})
class MessageFiles extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  path!: string;

  @ForeignKey(() => Message)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  messageId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Message)
  message!: Message;
}

export default MessageFiles;
