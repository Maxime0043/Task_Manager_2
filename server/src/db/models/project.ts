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
  @Column({ type: DataType.INTEGER, allowNull: false })
  statusId!: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  budget!: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isInternalProject!: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  managerId!: string;

  @ForeignKey(() => Client)
  @Column({ type: DataType.UUID, allowNull: false })
  clientId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
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

  @HasMany(() => Task)
  tasks!: Task[];

  @HasMany(() => TaskScheduled)
  taskScheduled!: TaskScheduled[];
}

export default Project;
