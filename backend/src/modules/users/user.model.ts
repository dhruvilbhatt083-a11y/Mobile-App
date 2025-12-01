import { User, DriverProfile, OwnerProfile, UserRole } from '@prisma/client';

export type UserWithProfiles = User & {
  driverProfile?: DriverProfile | null;
  ownerProfile?: OwnerProfile | null;
};

export { UserRole };
