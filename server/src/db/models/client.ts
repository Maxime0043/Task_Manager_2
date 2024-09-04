import {
  Table,
  Column,
  Model,
  DataType,
  IsEmail,
  Is,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";

import User from "./user";
import Project from "./project";

@Table({
  modelName: "Client",
  paranoid: true,
})
class Client extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name!: string;

  @IsEmail
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Is(RegExp(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/))
  @Column({ type: DataType.STRING, allowNull: true })
  phone!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  creatorId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => User)
  creator!: User;

  @HasMany(() => Project)
  projects!: Project[];
}

export default Client;
