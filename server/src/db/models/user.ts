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
} from "sequelize-typescript";
import bcrypt from "bcrypt";

import UserRoles from "./user_role";
import Client from "./client";
import Project from "./project";
import Task from "./task";
import TaskUsers from "./task_users";
import TaskFiles from "./task_files";
import TaskScheduled from "./task_scheduled";

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
  })
  roleId!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isAdmin!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => UserRoles)
  userRole!: UserRoles;

  @HasMany(() => Client)
  clientsCreated!: Client[];

  @HasMany(() => Project, "managerId")
  projectsManaged!: Project[];

  @HasMany(() => Project, "creatorId")
  projectsCreated!: Project[];

  @HasMany(() => Task, "creatorId")
  tasksCreated!: Task[];

  @BelongsToMany(() => Task, () => TaskUsers, "userId", "taskId")
  tasksAssigned!: Task[];

  @HasMany(() => TaskFiles)
  filesAddedToTasks!: TaskFiles[];

  @HasMany(() => TaskScheduled)
  tasksScheduled!: TaskScheduled[];

  /**
   * HOOKS
   */

  // This hook is called before the user is created
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(instance.password, salt);
  }
}

export default User;
