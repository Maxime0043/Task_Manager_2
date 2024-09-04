import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";

import User from "./user";

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

  @HasMany(() => User)
  users!: User[];
}

export default UserRoles;
