import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from "sequelize-typescript";

import User from "./user";
import Client from "./client";
import ProjectStatus from "./project_status";

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
  status!: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  budget!: number;

  @Column({ type: DataType.STRING, allowNull: true })
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
  createdBy!: string;

  /**
   * ASSOCIATIONS
   */

  // Add the associations here
}

export default Project;
