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
  @PrimaryGeneratedColumn("increment", {
    primaryKeyConstraintName: "PK_ORGANISMES_SOURCE_ID",
  })
  id: number;

  @OneToMany(
    () => OrganismesData,
    (organismesDatas) => organismesDatas.organismesSource,
  )
  organismesDatas: OrganismesData[];

  @Column({
    type: "varchar",
    nullable: false,
  })
  sourceName: string;

  static upsertOrganismesSource(toUpsert: Partial<OrganismesSource>) {
    return this.createQueryBuilder()
      .insert()
      .into(OrganismesSource)
      .values(toUpsert)
      .orUpdate(
        [
          "sourceName",
          "method",
          "url",
          "params",
          "query",
          "typeAuth",
          "token",
          "updateAt",
        ],
        "UK_ORGANISMES_SOURCE_NAME",
        {
          skipUpdateIfNoValuesChanged: true,
        },
      )
      .returning([
        "id",
        "method",
        "sourceName",
        "url",
        "params",
        "query",
        "typeAuth",
        "token",
      ])
      .execute();
  }
}
