import { test, expect } from '../src/fixtures';
import { buildPet, uniquePetId } from '../src/data/petFactory';
import { expectPetSchema } from '../src/helpers/assertions';

test.describe('POST /pet – Menambah pet baru', () => {
  test.describe('Positif', () => {
    test('TC-POST-01 membuat pet dengan semua field dan response sama dengan body', async ({ petClient, cleanup }) => {
      const pet = buildPet();
      cleanup(pet.id!);

      const res = await petClient.addPet(pet);

      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
      const body = await res.json();
      expectPetSchema(body);
      expect(body).toEqual(pet);
    });

    test('TC-POST-02 pet yang dibuat bisa diambil berdasarkan id', async ({ petClient, cleanup }) => {
      const pet = buildPet();
      cleanup(pet.id!);
      await petClient.addPet(pet);

      const res = await petClient.getPet(pet.id!);

      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(pet);
    });

    test('TC-POST-03 membuat pet hanya dengan field wajib dan server membuat id', async ({ petClient, cleanup }) => {
      const res = await petClient.addPet({ name: 'MinimalPet', photoUrls: [] });

      expect(res.status()).toBe(200);
      const body = await res.json();
      cleanup(body.id);
      expect(typeof body.id).toBe('number');
      expect(body.name).toBe('MinimalPet');
      expect(body.photoUrls).toEqual([]);
    });

    for (const status of ['pending', 'sold'] as const) {
      test(`TC-POST-04 membuat pet dengan status "${status}"`, async ({ petClient, cleanup }) => {
        const pet = buildPet({ status });
        cleanup(pet.id!);

        const res = await petClient.addPet(pet);

        expect(res.status()).toBe(200);
        expect((await res.json()).status).toBe(status);
      });
    }
  });

  test.describe('Negatif', () => {
    test(
      'TC-POST-05 menolak pet tanpa field wajib "name"',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-02: name tidak divalidasi, API mengembalikan 200' } },
      async ({ petClient, cleanup }) => {
        test.fail();
        const pet = buildPet();
        delete (pet as Partial<typeof pet>).name;
        cleanup(pet.id!);

        const res = await petClient.addPet(pet);

        expect(res.status()).toBe(405);
      },
    );

    test(
      'TC-POST-06 menolak status di luar enum',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-03: enum status tidak divalidasi, API mengembalikan 200' } },
      async ({ petClient, cleanup }) => {
        test.fail();
        const pet = { ...buildPet(), status: 'unknownStatus' };
        cleanup(pet.id!);

        const res = await petClient.addPet(pet);

        expect(res.status()).toBe(405);
      },
    );

    test(
      'TC-POST-07 mengembalikan client error jika id berupa string',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-04: tipe data salah mengembalikan 500' } },
      async ({ petClient }) => {
        test.fail();
        const res = await petClient.addPet({ id: 'abc', name: 'StrId', photoUrls: ['x'] });

        expect([400, 405]).toContain(res.status());
      },
    );

    test('TC-POST-08 mengembalikan 400 untuk JSON rusak', async ({ petClient }) => {
      const res = await petClient.addPetRaw('{"id": 123, "name": "broken", ');

      expect([400, 405]).toContain(res.status());
    });

    test('TC-POST-09 mengembalikan 405 untuk body kosong', async ({ petClient }) => {
      const res = await petClient.addPetRaw('');

      expect(res.status()).toBe(405);
    });

    test('TC-POST-10 mengembalikan 415 untuk Content-Type yang tidak didukung', async ({ petClient }) => {
      const res = await petClient.addPetRaw(JSON.stringify(buildPet()), 'text/plain');

      expect(res.status()).toBe(415);
    });

    test(
      'TC-POST-11 mengembalikan client error untuk tipe data field yang salah',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-04: tipe data salah mengembalikan 500' } },
      async ({ petClient }) => {
        test.fail();
        const res = await petClient.addPet({ id: uniquePetId(), name: 12345, photoUrls: 'notarray' });

        expect([400, 405]).toContain(res.status());
      },
    );

    test(
      'TC-POST-12 menolak id negatif atau menyimpannya sesuai yang dikirim',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-07: id negatif diganti diam-diam' } },
      async ({ petClient, cleanup }) => {
        test.fail();
        const res = await petClient.addPet({ id: -5, name: 'NegativeId', photoUrls: ['x'] });

        if (res.status() === 200) {
          const body = await res.json();
          cleanup(body.id);
          expect(body.id).toBe(-5);
        } else {
          expect([400, 405]).toContain(res.status());
        }
      },
    );
  });
});
