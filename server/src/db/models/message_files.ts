import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
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
  @Column({ type: DataType.UUID, allowNull: false })
  messageId!: string;

  /**
   * ASSOCIATIONS
   */

  // Add associations here
}

export default MessageFiles;
