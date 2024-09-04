import {
  Table,
  Column,
  Model,
  DataType,
  IsEmail,
  ForeignKey,
} from "sequelize-typescript";

import UserRoles from "./user_role";

@Table({
  modelName: "User",
  paranoid: true,
})
class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    autoIncrement: true,
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
  role!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isAdmin!: string;

  /**
   * ASSOCIATIONS
   */

  // Add associations here
}

export default User;
