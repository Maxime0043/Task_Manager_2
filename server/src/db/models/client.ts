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
  BeforeDestroy,
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

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  creatorId!: string;

  /**
   * ASSOCIATIONS
   */

  @BelongsTo(() => User)
  creator!: User;

  @HasMany(() => Project, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  projects!: Project[];

  /**
   * HOOKS
   */

  @BeforeDestroy
  static async deleteTasks(instance: Client, options: any) {
    if (!options.force) return;

    for (const project of instance.projects) {
      await project.destroy({ force: true });
    }
  }
}

export default Client;
