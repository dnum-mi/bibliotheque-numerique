import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationEntity } from "../../../entities/application_entity";
import { Dossier } from "../../../entities";
import { EInstructionTimeStateKey } from "../types/IntructionTime.type";

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

  @Column({ nullable: true })
  state: EInstructionTimeStateKey;

  static findByDossierId(id: number) {
    return this.findOne({
      where: { dossier: { id } },
      relations: { dossier: true },
    });
  }
}
