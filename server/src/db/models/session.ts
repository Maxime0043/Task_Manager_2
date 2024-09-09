import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  modelName: "Session",
})
class Session extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  sid!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expires!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  data!: string;
}

export default Session;
