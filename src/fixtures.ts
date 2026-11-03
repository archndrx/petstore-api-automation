import { test as base } from '@playwright/test';
import { PetClient } from './api/petClient';

type Fixtures = {
  petClient: PetClient;
  /** Daftarkan id pet untuk dihapus setelah test selesai. */
  cleanup: (petId: number) => void;
};

export const test = base.extend<Fixtures>({
  petClient: async ({ request }, use) => {
    await use(new PetClient(request));
  },
  cleanup: async ({ request }, use) => {
    const ids = new Set<number>();
    await use((id) => ids.add(id));
    const client = new PetClient(request);
    for (const id of ids) {
      await client.deletePet(id).catch(() => undefined);
    }
  },
});

export { expect } from '@playwright/test';
