import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";

export const rnfFieldKeys: Record<keyof CreateFoundationDto, RegExp> = {
  title: /.*\#rnf\-titre\-rnf\#.*/,
  type: /.*\#rnf\-type\-rnf\#.*/,
  address: /.*\#rnf\-addresse\-rnf\#.*/,
  email: /.*\#rnf\-courriel\-rnf\#.*/,
  phone: /.*\#rnf\-telephone\-rnf\#.*/,
  peopleInFoundationToCreate: /.*\#rnf\-personne\-rnf\#.*/,
};
