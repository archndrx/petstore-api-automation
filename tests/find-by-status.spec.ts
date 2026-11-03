import { test, expect } from '../src/fixtures';
import { buildPet } from '../src/data/petFactory';
import { expectPetSchema } from '../src/helpers/assertions';
import { PET_STATUSES, PetStatus } from '../src/types/pet';

test.describe('GET /pet/findByStatus – Mencari pet berdasarkan status', () => {
  test.describe('Positif', () => {
    for (const status of PET_STATUSES) {
      test(`TC-GET-01..03 hanya mengembalikan pet "${status}", termasuk pet yang baru dibuat`, async ({ petClient, cleanup }) => {
        const pet = buildPet({ status });
        cleanup(pet.id!);
        await petClient.addPet(pet);

        const res = await petClient.findByStatus([status]);

        expect(res.status()).toBe(200);
        const pets: Array<{ id: number; status: string }> = await res.json();
        expect(Array.isArray(pets)).toBe(true);
        expect(pets.length).toBeGreaterThan(0);
        expect(pets.filter((p) => p.status !== status), 'item dengan status lain').toEqual([]);
        expect(pets.map((p) => p.id)).toContain(pet.id);
      });
    }

    test(
      'TC-GET-04 mengembalikan pet dari semua status yang diminta (format multi, seperti Try it out)',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-01: format multi hanya memakai nilai status pertama' } },
      async ({ petClient, cleanup }) => {
        test.fail();
        const available = buildPet({ status: 'available' });
        const pending = buildPet({ status: 'pending' });
        cleanup(available.id!);
        cleanup(pending.id!);
        await petClient.addPet(available);
        await petClient.addPet(pending);

        const res = await petClient.findByStatus(['available', 'pending']);

        expect(res.status()).toBe(200);
        const ids = (await res.json()).map((p: { id: number }) => p.id);
        expect(ids).toContain(available.id);
        expect(ids).toContain(pending.id);
      },
    );

    test('TC-GET-05 menerima beberapa status yang dipisah koma (sesuai deskripsi endpoint)', async ({ petClient, cleanup }) => {
      const available = buildPet({ status: 'available' });
      const pending = buildPet({ status: 'pending' });
      cleanup(available.id!);
      cleanup(pending.id!);
      await petClient.addPet(available);
      await petClient.addPet(pending);

      const res = await petClient.findByStatus([], { rawQuery: 'status=available,pending' });

      expect(res.status()).toBe(200);
      const pets: Array<{ id: number; status: PetStatus }> = await res.json();
      expect(new Set(pets.map((p) => p.status))).toEqual(new Set(['available', 'pending']));
      expect(pets.map((p) => p.id)).toEqual(expect.arrayContaining([available.id, pending.id]));
    });

    test('TC-GET-06 mengembalikan XML jika Accept adalah application/xml', async ({ petClient }) => {
      const res = await petClient.findByStatus(['available'], { accept: 'application/xml' });

      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/xml');
      expect((await res.text()).trimStart()).toMatch(/^</);
    });

    test('TC-GET-07 merespons dalam 3 detik', async ({ petClient }) => {
      // Batas longgar karena sandbox publik dan overhead TLS di request pertama.
      const started = Date.now();
      const res = await petClient.findByStatus(['pending']);
      const elapsed = Date.now() - started;

      expect(res.status()).toBe(200);
      expect(elapsed).toBeLessThan(3_000);
    });

    test('TC-GET-12 data pet yang dibuat sesuai skema Pet', async ({ petClient, cleanup }) => {
      const pet = buildPet({ status: 'sold' });
      cleanup(pet.id!);
      await petClient.addPet(pet);

      const res = await petClient.findByStatus(['sold']);
      const ours = (await res.json()).find((p: { id: number }) => p.id === pet.id);

      expectPetSchema(ours);
    });
  });

  test.describe('Negatif', () => {
    const invalidQueries: Array<{ id: string; title: string; query: string }> = [
      { id: 'TC-GET-08', title: 'nilai status yang tidak dikenal', query: 'status=abc' },
      { id: 'TC-GET-09', title: 'parameter status yang tidak dikirim', query: '' },
      { id: 'TC-GET-10', title: 'nilai status huruf kapital', query: 'status=AVAILABLE' },
      { id: 'TC-GET-11', title: 'nilai status kosong', query: 'status=' },
    ];

    for (const { id, title, query } of invalidQueries) {
      test(
        `${id} mengembalikan 400 untuk ${title}`,
        { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-05: status tidak valid mengembalikan 200' } },
        async ({ petClient }) => {
          test.fail();
          const res = await petClient.findByStatus([], { rawQuery: query });

          expect(res.status()).toBe(400);
        },
      );
    }
  });
});
