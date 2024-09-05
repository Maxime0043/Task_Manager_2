import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from "sequelize-typescript";

import User from "./user";
import Task from "./task";

@Table({
  modelName: "TaskFiles",
  tableName: "TaskFiles",
})
class TaskFiles extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  path!: string;

  @ForeignKey(() => Task)
  @Column({ type: DataType.UUID, allowNull: false })
  taskId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  /**
   * ASSOCIATIONS
   */

  // Add associations here
}

export default TaskFiles;
