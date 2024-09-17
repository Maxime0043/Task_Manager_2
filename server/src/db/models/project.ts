import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";

import User from "./user";
import Client from "./client";
import ProjectStatus from "./project_status";
import Task from "./task";
import TaskScheduled from "./task_scheduled";

@Table({
  modelName: "Project",
  paranoid: true,
})
class Project extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name!: string;

  @ForeignKey(() => ProjectStatus)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  statusId!: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  budget!: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isInternalProject!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  managerId!: string;

  @ForeignKey(() => Client)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  clientId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  creatorId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => ProjectStatus)
  projectStatus!: ProjectStatus;

  @BelongsTo(() => User, "managerId")
  manager!: User;

  @BelongsTo(() => Client)
  client!: Client;

  @BelongsTo(() => User, "creatorId")
  creator!: User;

  @HasMany(() => Task, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  tasks!: Task[];

  @HasMany(() => TaskScheduled, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  taskScheduled!: TaskScheduled[];
}

export default Project;
