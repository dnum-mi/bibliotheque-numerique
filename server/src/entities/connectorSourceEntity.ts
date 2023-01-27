import { ApplicationEntity } from "./applicationEntity";

import { Column } from "typeorm";

export enum TypeAuth {
  BEARER_TOKEN = "Bearer Token",
}

export class ConnectorSourceEntity extends ApplicationEntity {
  @Column({
    type: "varchar",
    nullable: false,
  })
  url: string;

  @Column({ type: "jsonb" })
  params: Record<string, string>[];

  @Column({ type: "jsonb" })
  query: Record<string, string>[];

  @Column()
  typeAuth: TypeAuth;

  @Column()
  token: string;
}
