import { Table, Column, Model, DataType } from "sequelize-typescript";

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

  // Add associations here
}

export default Conversation;
