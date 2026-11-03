# Petstore API Automation

Take Home Test – Task 2. Automation test API untuk tiga endpoint [Swagger Petstore](https://petstore.swagger.io/), dibuat dengan **Playwright Test + TypeScript**.

| Endpoint | File spec | Jumlah test |
| --- | --- | --- |
| `POST /pet` | `tests/post-pet.spec.ts` | 13 |
| `GET /pet/findByStatus` | `tests/find-by-status.spec.ts` | 12 |
| `DELETE /pet/{petId}` | `tests/delete-pet.spec.ts` | 7 |
| **Total** | | **32** |

ID test (`TC-POST-01`, `TC-GET-04`, …) sama dengan laporan pengujian manual di Task 1.

## Kebutuhan

- Node.js 18 atau lebih baru (`node -v`)

## Instalasi dan menjalankan test

```bash
npm install
npm test              # jalankan semua test
npm run report        # buka laporan HTML
```

Perintah lain:

```bash
npm run test:stable   # hanya test untuk fitur yang sudah berjalan benar
npm run test:bugs     # hanya test yang mendokumentasikan defect
npm run typecheck     # cek tipe TypeScript
```

Untuk menjalankan ke environment lain, gunakan `PETSTORE_BASE_URL`, misalnya
`PETSTORE_BASE_URL=https://staging.example.com/v2/ npm test` (akhiri dengan `/`).

Laporan tersimpan di `playwright-report/` (HTML) dan `test-results/junit.xml` (JUnit, untuk CI).

## Laporan

| File | Isi |
| --- | --- |
| [TEST_REPORT.md](TEST_REPORT.md) | Ringkasan hasil run terakhir dan hasil per test |
| [BUG_REPORT.md](BUG_REPORT.md) | Bug yang ditemukan: langkah reproduksi, expected, actual |
| `reports/html/index.html` | Laporan HTML Playwright (buka di browser, atau `npx playwright show-report reports/html`) |
| `reports/junit.xml` | Hasil dalam format JUnit |

Setiap `npm test` membuat laporan baru di `playwright-report/` dan `test-results/` (tidak di-commit). Untuk memperbarui laporan di repo, salin hasilnya ke `reports/`.

## Defect yang sudah diketahui

Detail setiap bug ada di [BUG_REPORT.md](BUG_REPORT.md). Setiap test mengecek perilaku sesuai spesifikasi Swagger. Test yang terkena defect diberi tag
`@known-bug`, anotasi `issue` berisi ID bug, dan ditandai `test.fail()`:

- Selama bug masih ada, test gagal sesuai harapan dan hasil run tetap hijau.
- Jika bug sudah diperbaiki, test **lolos di luar dugaan dan run menjadi merah**, tanda bahwa `test.fail()` perlu dihapus.

| Bug | Test |
| --- | --- |
| BUG-01 Dokumentasi tidak konsisten: format multi (dikirim Try it out) hanya memakai `status` pertama | TC-GET-04 |
| BUG-02 Field wajib `name` tidak divalidasi | TC-POST-05 |
| BUG-03 Enum `status` tidak divalidasi | TC-POST-06 |
| BUG-04 Tipe data salah menghasilkan 500 | TC-POST-07, TC-POST-11 |
| BUG-05 `status` tidak valid/tidak dikirim/kosong menghasilkan 200 | TC-GET-08 – 11 |
| BUG-06 id bukan angka menghasilkan 404 dan membocorkan Java exception | TC-DEL-08 |
| BUG-07 id negatif diganti diam-diam | TC-POST-12 |

## Struktur project

```
src/
  api/petClient.ts        wrapper untuk endpoint /pet
  data/petFactory.ts      pembuat data uji dengan id unik
  helpers/assertions.ts   pengecekan skema Pet
  fixtures.ts             fixture petClient + cleanup otomatis pet yang dibuat
  types/pet.ts            tipe Pet sesuai spesifikasi Swagger
tests/
  post-pet.spec.ts
  find-by-status.spec.ts
  delete-pet.spec.ts
reports/                  laporan HTML dan JUnit dari run terakhir
TEST_REPORT.md            ringkasan hasil test
BUG_REPORT.md             detail bug yang ditemukan
playwright.config.ts      base URL, reporter, retry
```

## Catatan desain

- **Test independen.** Setiap test membuat pet sendiri dengan id unik (9100000000+), lalu fixture `cleanup`
  menghapusnya setelah test selesai. Test bisa berjalan paralel, tidak bergantung pada urutan maupun data
  pengguna lain di sandbox publik.
- **Tidak bergantung pada data yang sudah ada.** Test pencarian mencari pet yang baru dibuat, bukan
  menghitung jumlah hasil, karena isi sandbox publik selalu berubah.
- **Body mentah dikirim sebagai Buffer** (`addPetRaw`). Jika dikirim sebagai string, Playwright mengubahnya
  menjadi JSON string, sehingga kasus JSON rusak dan body kosong tidak teruji dengan benar.
- **Retry 1x** di `playwright.config.ts` untuk mengatasi gangguan jaringan di server publik.
- **Response time** memakai batas 3 detik, karena request pertama lebih lambat akibat setup TLS.
