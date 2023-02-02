import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationEntity } from "../../../entities/application_entity";
import { Dossier } from "../../../entities";

@Entity({ name: "instruction_times" })
export class InstructionTime extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => Dossier)
  @JoinColumn()
  dossier: Dossier;

  @Column({ type: "timestamp" })
  startAt: Date;

  @Column({ type: "timestamp" })
  stopAt: Date;

  @Column({ type: "timestamp" })
  endAt: Date;

  @Column()
  state: string;

  static findByDossierId(id: number) {
    return this.findOne({
      where: { dossier: { id } },
      relations: { dossier: true },
    });
  }
}
