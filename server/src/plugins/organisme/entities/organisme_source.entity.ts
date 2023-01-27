import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { OrganismesData } from "./organisme_data.entity";
import { ConnectorSourceEntity } from "../../../entities/connectorSourceEntity";

@Entity({ name: "organismes_sources" })
@Unique("UK_ORGANISMES_SOURCE_NAME", ["sourceName"])
export class OrganismesSource extends ConnectorSourceEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToMany(
    () => OrganismesData,
    (organismesDatas) => organismesDatas.organismesSource,
  )
  organismesDatas: OrganismesData[];

  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  sourceName: string;

  static upsertOrganismesSource(toUpsert: Partial<OrganismesSource>) {
    return this.createQueryBuilder()
      .insert()
      .into(OrganismesSource)
      .values(toUpsert)
      .orUpdate(
        ["name", "url", "params", "query", "typeAuth", "token", "updateAt"],
        "UK_ORGANISMES_SOURCE_NAME",
        {
          skipUpdateIfNoValuesChanged: true,
        },
      )
      .returning(["id", "name", "url", "params", "query", "typeAuth", "token"])
      .execute();
  }
}
