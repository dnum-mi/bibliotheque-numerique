import { Column, Entity, PrimaryColumn } from "typeorm";
import { Demarche as TDemarche } from "@dnum-mi/ds-api-client/dist/@types/types";
import { BaseEntity } from "../../../shared/base-entity/base.entity";

@Entity({ name: "demarches_ds" })
export class DemarcheDS extends BaseEntity {
  @PrimaryColumn("int", { primaryKeyConstraintName: "PK_DEMARCHE_DS_ID" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDemarche>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;
}
