import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from "sequelize-typescript";

import User from "./user";
import Project from "./project";
import Task from "./task";

@Table({
  modelName: "TaskScheduled",
  tableName: "TaskScheduled",
})
class TaskScheduled extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  start!: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  end!: Date;

  @ForeignKey(() => Task)
  @Column({ type: DataType.UUID, allowNull: true })
  taskId!: string;

  @ForeignKey(() => Project)
  @Column({ type: DataType.UUID, allowNull: true })
  projectId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  /**
   * ASSOCIATIONS
   */

  // Add associations here
}

export default TaskScheduled;
