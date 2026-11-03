import { expect } from '@playwright/test';
import { PET_STATUSES } from '../types/pet';

export function expectPetSchema(pet: any): void {
  expect(pet, 'pet harus berupa object').toEqual(expect.any(Object));
  expect(typeof pet.id, 'id harus berupa angka').toBe('number');
  expect(typeof pet.name, 'name wajib ada dan berupa string').toBe('string');
  expect(Array.isArray(pet.photoUrls), 'photoUrls wajib ada dan berupa array').toBe(true);
  if (pet.status !== undefined) {
    expect(PET_STATUSES, `status "${pet.status}" harus salah satu nilai enum`).toContain(pet.status);
  }
  if (pet.tags !== undefined) {
    expect(Array.isArray(pet.tags), 'tags harus berupa array').toBe(true);
  }
}
