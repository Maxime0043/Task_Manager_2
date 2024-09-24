import {
  Table,
  Column,
  Model,
  DataType,
  IsEmail,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  BeforeCreate,
  BeforeUpdate,
  BeforeDestroy,
} from "sequelize-typescript";
import bcrypt from "bcrypt";

import UserRoles from "./user_role";
import Client from "./client";
import Project from "./project";
import Task from "./task";
import TaskUsers from "./task_users";
import TaskFiles from "./task_files";
import TaskScheduled from "./task_scheduled";
import { deleteFile } from "../../storage";

@Table({
  modelName: "User",
  paranoid: true,
})
class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  firstName!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastName!: string;

  @IsEmail
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  icon!: string;

  @ForeignKey(() => UserRoles)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  roleId!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isAdmin!: boolean;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => UserRoles)
  userRole!: UserRoles;

  @HasMany(() => Client, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  clientsCreated!: Client[];

  @HasMany(() => Project, {
    foreignKey: "managerId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  projectsManaged!: Project[];

  @HasMany(() => Project, {
    foreignKey: "creatorId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  projectsCreated!: Project[];

  @HasMany(() => Task, {
    foreignKey: "creatorId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  tasksCreated!: Task[];

  @BelongsToMany(() => Task, () => TaskUsers, "userId", "taskId")
  tasksAssigned!: Task[];

  @HasMany(() => TaskFiles, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  filesAddedToTasks!: TaskFiles[];

  @HasMany(() => TaskScheduled, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  tasksScheduled!: TaskScheduled[];

  /**
   * HOOKS
   */

  // This hook is called before the user is created
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    // Hash the password if it has been changed
    if (!instance.isNewRecord && !instance.changed("password")) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(instance.password, salt);
  }

  @BeforeDestroy
  static async deleteImage(instance: User, options: any) {
    if (!options.force) return;

    if (instance.icon) {
      await deleteFile(instance.icon);
    }
  }
}

export default User;
