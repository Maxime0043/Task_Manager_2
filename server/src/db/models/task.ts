import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
  BeforeDestroy,
} from "sequelize-typescript";

import User from "./user";
import Project from "./project";
import TaskStatus from "./task_status";
import TaskUsers from "./task_users";
import TaskFiles from "./task_files";
import TaskScheduled from "./task_scheduled";
import { deleteFile } from "../../storage";

export const TASK_PRIORITIES = {
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
};

@Table({
  modelName: "Task",
  paranoid: true,
})
class Task extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  timeEstimate!: number;

  @Column({ type: DataType.DATE, allowNull: true })
  deadline!: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  percentDone!: number;

  @ForeignKey(() => TaskStatus)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  statusId!: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string;

  @Column({
    type: DataType.ENUM(...Object.values(TASK_PRIORITIES)),
    allowNull: false,
    defaultValue: TASK_PRIORITIES.NORMAL,
  })
  priority!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  position!: number;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  projectId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  creatorId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => TaskStatus)
  taskStatus!: TaskStatus;

  @BelongsTo(() => User, "creatorId")
  creator!: User;

  @BelongsTo(() => Project)
  project!: Project;

  @BelongsToMany(() => User, () => TaskUsers, "taskId", "userId")
  usersAssigned!: User[];

  @HasMany(() => TaskFiles, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  files!: TaskFiles[];

  @HasMany(() => TaskScheduled, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  scheduled!: TaskScheduled[];

  /**
   * HOOKS
   */

  @BeforeDestroy
  static async deleteFiles(instance: Task, options: any) {
    if (!options.force) return;

    const taskFiles = await instance.$get("files");

    for (const file of taskFiles) {
      await deleteFile(file.path);
    }
  }
}

export default Task;
