import {
  Table,
  Column,
  Model,
  DataType,
  IsEmail,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";

import UserRoles from "./user_role";
import Client from "./client";
import Project from "./project";

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
}

export default User;
