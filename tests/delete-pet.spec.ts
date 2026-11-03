import { test, expect } from '../src/fixtures';
import { buildPet } from '../src/data/petFactory';

test.describe('DELETE /pet/{petId} – Menghapus pet berdasarkan ID', () => {
  test.describe('Positif', () => {
    test('TC-DEL-01/02 menghapus pet yang ada dan pet tidak bisa ditemukan lagi', async ({ petClient }) => {
      const pet = buildPet();
      expect((await petClient.addPet(pet)).status()).toBe(200);

      const res = await petClient.deletePet(pet.id!, 'special-key');

      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ code: 200, message: String(pet.id) });

      const getRes = await petClient.getPet(pet.id!);
      expect(getRes.status()).toBe(404);
      expect(await getRes.json()).toMatchObject({ message: 'Pet not found' });
    });

    test('TC-DEL-03 menghapus pet tanpa header api_key (opsional)', async ({ petClient }) => {
      const pet = buildPet();
      await petClient.addPet(pet);

      const res = await petClient.deletePet(pet.id!);

      expect(res.status()).toBe(200);
    });
  });

  test.describe('Negatif', () => {
    test('TC-DEL-04 mengembalikan 404 jika pet yang sama dihapus dua kali', async ({ petClient }) => {
      const pet = buildPet();
      await petClient.addPet(pet);
      expect((await petClient.deletePet(pet.id!)).status()).toBe(200);

      const res = await petClient.deletePet(pet.id!);

      expect(res.status()).toBe(404);
    });

    test('TC-DEL-05 mengembalikan 404 untuk id yang tidak ada', async ({ petClient }) => {
      const res = await petClient.deletePet(987654321987);

      expect(res.status()).toBe(404);
    });

    test('TC-DEL-06 mengembalikan 404 untuk id negatif', async ({ petClient }) => {
      const res = await petClient.deletePet(-1);

      expect(res.status()).toBe(404);
    });

    test('TC-DEL-07 mengembalikan 405 jika id tidak dikirim', async ({ petClient }) => {
      const res = await petClient.deletePet('');

      expect(res.status()).toBe(405);
    });

    test(
      'TC-DEL-08 mengembalikan 400 untuk id bukan angka tanpa membocorkan detail internal',
      { tag: '@known-bug', annotation: { type: 'issue', description: 'BUG-06: mengembalikan 404 dan membocorkan NumberFormatException' } },
      async ({ petClient }) => {
        test.fail();
        const res = await petClient.deletePet('abc');

        expect(res.status()).toBe(400);
        expect(await res.text()).not.toContain('Exception');
      },
    );
  });
});
