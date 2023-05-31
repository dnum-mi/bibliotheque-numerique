import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationEntity } from "../../../shared/entities/application_entity";
import { EInstructionTimeStateKey } from "../types/IntructionTime.type";
import { Dossier } from "../../../modules/dossiers/entities/dossier.entity";

@Entity({ name: "instruction_times" })
export class InstructionTime extends ApplicationEntity {
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

  static findByDossierId(id: number) {
    return this.findOne({
      where: { dossier: { id } },
      relations: { dossier: true },
    });
  }
}
