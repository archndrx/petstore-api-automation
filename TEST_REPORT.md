# Laporan Hasil Test – Petstore API Automation

Run terakhir: **3 November 2026, 15:33 WIB** · Playwright Test · base URL `https://petstore.swagger.io/v2/`

**32 test, 32 passed, 0 failed** (durasi 12,9 detik, 4 worker). 11 di antaranya adalah test `@known-bug` yang ditandai `test.fail()`: test tersebut gagal sesuai harapan karena defect di API, sehingga dihitung passed oleh Playwright.

| Endpoint | Test | Passed | Known bug (expected fail) |
| --- | --- | --- | --- |
| `POST /pet` | 13 | 13 | 5 |
| `GET /pet/findByStatus` | 12 | 12 | 5 |
| `DELETE /pet/{petId}` | 7 | 7 | 1 |

## Detail per test

| ID | Test | Hasil | Durasi |
| --- | --- | --- | --- |
| TC-POST-01 | membuat pet dengan semua field dan response sama dengan body | Pass | 1,3 s |
| TC-POST-02 | pet yang dibuat bisa diambil berdasarkan id | Pass | 1,7 s |
| TC-POST-03 | membuat pet hanya dengan field wajib dan server membuat id | Pass | 1,4 s |
| TC-POST-04 | membuat pet dengan status "pending" | Pass | 1,4 s |
| TC-POST-04 | membuat pet dengan status "sold" | Pass | 1,5 s |
| TC-POST-05 | menolak pet tanpa field wajib "name" | Pass – expected fail (BUG-02) | 1,5 s |
| TC-POST-06 | menolak status di luar enum | Pass – expected fail (BUG-03) | 1,5 s |
| TC-POST-07 | mengembalikan client error jika id berupa string | Pass – expected fail (BUG-04) | 1,2 s |
| TC-POST-08 | mengembalikan 400 untuk JSON rusak | Pass | 1,2 s |
| TC-POST-09 | mengembalikan 405 untuk body kosong | Pass | 1,1 s |
| TC-POST-10 | mengembalikan 415 untuk Content-Type yang tidak didukung | Pass | 1,1 s |
| TC-POST-11 | mengembalikan client error untuk tipe data field yang salah | Pass – expected fail (BUG-04) | 1,1 s |
| TC-POST-12 | menolak id negatif atau menyimpannya sesuai yang dikirim | Pass – expected fail (BUG-07) | 1,3 s |
| TC-GET-01..03 | hanya mengembalikan pet "available", termasuk pet yang baru dibuat | Pass | 1,9 s |
| TC-GET-01..03 | hanya mengembalikan pet "pending", termasuk pet yang baru dibuat | Pass | 1,7 s |
| TC-GET-01..03 | hanya mengembalikan pet "sold", termasuk pet yang baru dibuat | Pass | 1,7 s |
| TC-GET-04 | mengembalikan pet dari semua status yang diminta (format multi, seperti Try it out) | Pass – expected fail (BUG-01) | 2,6 s |
| TC-GET-05 | menerima beberapa status yang dipisah koma (sesuai deskripsi endpoint) | Pass | 2,7 s |
| TC-GET-06 | mengembalikan XML jika Accept adalah application/xml | Pass | 1,5 s |
| TC-GET-07 | merespons dalam 3 detik | Pass | 1,3 s |
| TC-GET-08 | mengembalikan 400 untuk nilai status yang tidak dikenal | Pass – expected fail (BUG-05) | 1,1 s |
| TC-GET-09 | mengembalikan 400 untuk parameter status yang tidak dikirim | Pass – expected fail (BUG-05) | 1,2 s |
| TC-GET-10 | mengembalikan 400 untuk nilai status huruf kapital | Pass – expected fail (BUG-05) | 1,0 s |
| TC-GET-11 | mengembalikan 400 untuk nilai status kosong | Pass – expected fail (BUG-05) | 1,0 s |
| TC-GET-12 | data pet yang dibuat sesuai skema Pet | Pass | 1,7 s |
| TC-DEL-01/02 | menghapus pet yang ada dan pet tidak bisa ditemukan lagi | Pass | 2,1 s |
| TC-DEL-03 | menghapus pet tanpa header api_key (opsional) | Pass | 1,8 s |
| TC-DEL-04 | mengembalikan 404 jika pet yang sama dihapus dua kali | Pass | 2,1 s |
| TC-DEL-05 | mengembalikan 404 untuk id yang tidak ada | Pass | 1,5 s |
| TC-DEL-06 | mengembalikan 404 untuk id negatif | Pass | 1,2 s |
| TC-DEL-07 | mengembalikan 405 jika id tidak dikirim | Pass | 1,1 s |
| TC-DEL-08 | mengembalikan 400 untuk id bukan angka tanpa membocorkan detail internal | Pass – expected fail (BUG-06) | 1,1 s |

## Bug

Defect yang ditemukan dijelaskan lengkap (langkah reproduksi, expected, actual) di [BUG_REPORT.md](BUG_REPORT.md).

## File laporan

- `reports/html/index.html` – laporan HTML Playwright. Unduh repo lalu buka file ini di browser, atau jalankan `npx playwright show-report reports/html`.
- `reports/junit.xml` – hasil dalam format JUnit, untuk CI.
