import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
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
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  start!: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  end!: Date;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  taskId!: string;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  projectId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  userId!: string;

  @Column(DataType.VIRTUAL)
  get duration() {
    const today = new Date();
    const day =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();

    const start = new Date(day + " " + this.start);
    const end = new Date(day + " " + this.end);

    return (end.getTime() - start.getTime()) / 1000 / 60 / 60; // in hours
  }

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Task)
  task!: Task;

  @BelongsTo(() => Project)
  project!: Project;

  @BelongsTo(() => User)
  user!: User;
}

export default TaskScheduled;
