import {
  Property,
  SecurityAssignment,
  User,
} from "../../prisma/generated/prisma";

export type SecurityDetails = SecurityAssignment & {
  Security: Omit<User, "password">;
  Property: Property;
};
