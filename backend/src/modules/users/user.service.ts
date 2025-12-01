import { UserRole } from '@prisma/client';

import { prisma } from '../../db/prisma';

export const findUserByPhoneAndRole = (phoneNumber: string, role: UserRole) =>
  prisma.user.findUnique({
    where: {
      phoneNumber_role: {
        phoneNumber,
        role,
      },
    },
    include: {
      driverProfile: true,
      ownerProfile: true,
    },
  });

export const ensureUserWithRole = async (phoneNumber: string, role: UserRole) => {
  const existing = await findUserByPhoneAndRole(phoneNumber, role);
  if (existing) return existing;

  const defaults = {
    name: role === 'DRIVER' ? 'New Driver' : 'New Owner',
    city: null,
    isActive: true,
  };

  const user = await prisma.user.create({
    data: {
      phoneNumber,
      role,
      ...defaults,
      driverProfile:
        role === 'DRIVER'
          ? {
              create: {},
            }
          : undefined,
      ownerProfile:
        role === 'OWNER'
          ? {
              create: {},
            }
          : undefined,
    },
    include: {
      driverProfile: true,
      ownerProfile: true,
    },
  });

  return user;
};
