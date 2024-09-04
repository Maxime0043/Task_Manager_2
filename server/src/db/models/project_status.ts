import { Table, Column, Model, DataType, Is } from "sequelize-typescript";

@Table({
  modelName: "ProjectStatus",
})
class ProjectStatus extends Model {
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

  // Add the associations here
}

export default ProjectStatus;
