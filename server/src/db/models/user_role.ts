import { Table, Column, Model, DataType, IsEmail } from "sequelize-typescript";

@Table({
  modelName: "UserRoles",
})
class UserRoles extends Model {
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

  /**
   * ASSOCIATIONS
   */

  // Add associations here
}

export default UserRoles;
