import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
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
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  taskId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  userId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => Task)
  task!: Task;

  @BelongsTo(() => User)
  user!: User;
}

export default TaskFiles;
