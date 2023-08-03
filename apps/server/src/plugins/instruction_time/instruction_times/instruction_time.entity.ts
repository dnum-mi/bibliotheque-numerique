import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EInstructionTimeStateKey } from "./types/IntructionTime.type";
import { Dossier } from "../../../modules/dossiers/objects/entities/dossier.entity";
import { BaseEntity } from "../../../shared/base-entity/base.entity";

@Entity({ name: "instruction_times" })
export class InstructionTime extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => Dossier)
  @JoinColumn()
  dossier: Dossier;

  @Column({ nullable: true, type: "timestamp" })
  startAt: Date;

  @Column({ nullable: true, type: "timestamp" })
  stopAt: Date;

  @Column({ nullable: true, type: "timestamp" })
  endAt: Date;

  @Column({ nullable: false, default: "" })
  state: EInstructionTimeStateKey;
}
