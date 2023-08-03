import { FoundationType } from "@prisma/client";
import { Mapper } from "@/modules/ds/objects/types/mapper.type";
import { universalMapper } from "@/modules/ds/objects/mappers/universal.mapper";

export const EntrepriseFoundationMapper: Mapper = {
  ...universalMapper,
  type: () => FoundationType.FE as string,
  phone: () => `+33${Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("")}`,
  email: () => `fake-email-${Math.floor(Math.random() * 10000)}@gmail.com`,
};
