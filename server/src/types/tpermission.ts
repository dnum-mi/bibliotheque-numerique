import { PermissionName } from "./permissions";

export type TPermission = {
  name: PermissionName;
  write?: boolean;
  delete?: boolean;
};
