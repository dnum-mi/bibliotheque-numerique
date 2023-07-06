import { Column, Entity, PrimaryColumn } from "typeorm";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { BaseEntity } from "../../../shared/base-entity/base.entity";

@Entity({ name: "dossiers_ds" })
export class DossierDS extends BaseEntity {
  @PrimaryColumn({ primaryKeyConstraintName: "PK_DOSSIER_DS_ID" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDossier>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;
}
