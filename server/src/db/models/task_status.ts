import {
  Table,
  Column,
  Model,
  DataType,
  Is,
  HasMany,
} from "sequelize-typescript";

import Task from "./task";

@Table({
  modelName: "TaskStatus",
  tableName: "TaskStatus",
  paranoid: true,
})
class TaskStatus extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  label!: string;

  @Is(RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))
  @Column({ type: DataType.STRING, allowNull: false })
  color!: string;

  /**
   * ASSOCIATIONS
   */

  @HasMany(() => Task, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  tasks!: Task[];
}

export default TaskStatus;
