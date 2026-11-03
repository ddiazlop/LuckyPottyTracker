import type { DogProfile } from '../types';

export const DEFAULT_AVATAR = '/images/dog_mascot_avatar_1792141800760.jpg';

export const DEFAULT_PROFILE: DogProfile = {
  id: 'dog-1',
  name: 'Lucky',
  breed: 'Golden Retriever',
  lifeStage: 'adult',
  isPuppy: false,
  avatarUrl: DEFAULT_AVATAR,
  targetIntervalHours: 4,
};
