export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  USER = "USER",
}

// Role hierarchy key:value pairs
export const RoleHierarchy: { [key in Role]: number } = {
  [Role.SUPER_ADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.OPERATOR]: 2,
  [Role.USER]: 1,
};
