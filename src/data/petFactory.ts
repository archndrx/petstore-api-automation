import { Pet, PetStatus } from '../types/pet';

/** Rentang id tinggi agar tidak bentrok dengan data pengguna lain di sandbox. */
export function uniquePetId(): number {
  return 9_100_000_000 + Math.floor(Math.random() * 100_000_000);
}

export function buildPet(overrides: Partial<Pet> = {}): Pet {
  const id = overrides.id ?? uniquePetId();
  return {
    id,
    category: { id: 1, name: 'Dogs' },
    name: `QA-Pet-${id}`,
    photoUrls: ['https://example.com/photo.jpg'],
    tags: [{ id: 1, name: 'qa-automation' }],
    status: 'available' as PetStatus,
    ...overrides,
  };
}
