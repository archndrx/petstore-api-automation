# Bug Report – Petstore API

Ditemukan 7 bug dan ketidaksesuaian antara dokumentasi Swagger dan response API: 5 Medium dan 2 Low.

| Item | Detail |
| --- | --- |
| Aplikasi | Swagger Petstore, base URL `https://petstore.swagger.io/v2` |
| Acuan expected result | Spesifikasi Swagger 2.0 di `https://petstore.swagger.io/v2/swagger.json` |
| Tanggal pengujian | 3 November 2026 |
| Tool | Postman Collection Runner, Newman, Playwright (TypeScript) |

| ID | Judul | Endpoint | Severity | Priority | Test case |
| --- | --- | --- | --- | --- | --- |
| [BUG-01](#bug-01) | Dokumentasi tidak konsisten: Try it out mengirim format multi, API hanya memakai status pertama | GET /pet/findByStatus | Medium | Medium | TC-GET-04 |
| [BUG-02](#bug-02) | Field wajib `name` tidak divalidasi | POST /pet | Medium | High | TC-POST-05, TC-GET-12 |
| [BUG-03](#bug-03) | Enum `status` tidak divalidasi | POST /pet | Medium | Medium | TC-POST-06 |
| [BUG-04](#bug-04) | Tipe data salah menghasilkan 500, bukan client error | POST /pet | Medium | Medium | TC-POST-07, TC-POST-11 |
| [BUG-05](#bug-05) | `status` tidak valid, tidak dikirim, atau kosong menghasilkan 200 | GET /pet/findByStatus | Low | Medium | TC-GET-08 – 11 |
| [BUG-06](#bug-06) | id bukan angka menghasilkan 404 dan membocorkan Java exception | DELETE /pet/{petId} | Medium | High | TC-DEL-08 |
| [BUG-07](#bug-07) | id negatif diganti diam-diam | POST /pet | Low | Low | TC-POST-12 |

Di automation test, setiap bug di atas ditandai `@known-bug` dan `test.fail()` pada test case terkait.

---

## BUG-01

**Dokumentasi tidak konsisten: Try it out mengirim format multi, API hanya memakai status pertama** · Severity Medium · Priority Medium · `GET /pet/findByStatus`

Deskripsi endpoint menyebut "Multiple status values can be provided with comma separated strings" (`?status=available,pending`), dan format ini berfungsi dengan benar (TC-GET-05). Namun parameter `status` didefinisikan sebagai array dengan `collectionFormat: multi` di `swagger.json`, sehingga tombol **Try it out** di halaman Swagger yang sama mengirim `?status=available&status=pending`. API hanya memakai nilai pertama dari format ini, tanpa pesan error.

1. Buka https://petstore.swagger.io, pilih **GET /pet/findByStatus** → **Try it out**.
2. Pada parameter `status`, pilih **available** dan **pending** (tahan Cmd/Ctrl saat klik).
3. Klik **Execute**, lalu perhatikan **Request URL** dan isi response.

```bash
curl -s "https://petstore.swagger.io/v2/pet/findByStatus?status=available&status=pending"
```

- **Expected:** dokumentasi konsisten dengan perilaku API: Try it out mengirim format koma, atau API juga mendukung `status=a&status=b`. Response berisi pet available dan pending.
- **Actual:** Request URL dari Swagger UI adalah `?status=available&status=pending`; response 200 hanya berisi pet available (214 item, 0 pending). Urutan dibalik hanya mengembalikan pet pending.
- **Saran perbaikan:** ubah definisi parameter menjadi `collectionFormat: csv` agar sesuai deskripsi, atau dukung kedua format di API.

## BUG-02

**Field wajib `name` tidak divalidasi** · Severity Medium · Priority High · `POST /pet`

Skema `Pet` menandai `name` dan `photoUrls` sebagai required; spesifikasi mendokumentasikan 405 Invalid input.

```bash
curl -s -X POST "https://petstore.swagger.io/v2/pet" -H "Content-Type: application/json" \
  -d '{"id":9100000001,"photoUrls":["x"],"status":"available"}'
```

- **Expected:** 405 Invalid input.
- **Actual:** 200, pet tersimpan tanpa `name`: `{"id":9100000001,"photoUrls":["x"],"tags":[],"status":"available"}`. Data seperti ini lalu muncul di pencarian: 7 pet available tanpa `name` dan 1 pet sold tanpa `photoUrls` (TC-GET-12).

## BUG-03

**Enum `status` tidak divalidasi** · Severity Medium · Priority Medium · `POST /pet`

```bash
curl -s -X POST "https://petstore.swagger.io/v2/pet" -H "Content-Type: application/json" \
  -d '{"id":9100000002,"name":"BadStatus","photoUrls":["x"],"status":"unknownStatus"}'
```

- **Expected:** 405 Invalid input (status harus `available`, `pending`, atau `sold`).
- **Actual:** 200, tersimpan dengan `"status":"unknownStatus"`. Pet ini tidak akan muncul di pencarian status yang valid.

## BUG-04

**Tipe data salah menghasilkan 500, bukan client error** · Severity Medium · Priority Medium · `POST /pet`

```bash
curl -s -X POST "https://petstore.swagger.io/v2/pet" -H "Content-Type: application/json" \
  -d '{"id":"abc","name":"StrId","photoUrls":["x"]}'
curl -s -X POST "https://petstore.swagger.io/v2/pet" -H "Content-Type: application/json" \
  -d '{"id":9100000004,"name":12345,"photoUrls":"notarray"}'
```

- **Expected:** 405 Invalid input (atau 400) dengan pesan yang menyebut field yang salah.
- **Actual:** 500 `{"code":500,"type":"unknown","message":"something bad happened"}` untuk kedua request.

## BUG-05

**`status` tidak valid, tidak dikirim, atau kosong menghasilkan 200** · Severity Low · Priority Medium · `GET /pet/findByStatus`

Spesifikasi menandai `status` sebagai required dan mendokumentasikan 400 Invalid status value.

| Request | Expected | Actual |
| --- | --- | --- |
| `?status=abc` | 400 | 200, `[]` |
| tanpa parameter `status` | 400 | 200, `[]` |
| `?status=AVAILABLE` | 400 | 200, `[]` |
| `?status=` | 400 | 200, daftar pet yang status-nya string kosong |

## BUG-06

**id bukan angka menghasilkan 404 dan membocorkan Java exception** · Severity Medium · Priority High · `DELETE /pet/{petId}`

```bash
curl -s -X DELETE "https://petstore.swagger.io/v2/pet/abc"
```

- **Expected:** 400 Invalid ID supplied, tanpa detail teknis server.
- **Actual:** 404 `{"code":404,"type":"unknown","message":"java.lang.NumberFormatException: For input string: \"abc\""}`. Status code salah, dan pesan membocorkan teknologi server (information disclosure).

## BUG-07

**id negatif diganti diam-diam** · Severity Low · Priority Low · `POST /pet`

```bash
curl -s -X POST "https://petstore.swagger.io/v2/pet" -H "Content-Type: application/json" \
  -d '{"id":-5,"name":"NegativeId","photoUrls":["x"]}'
```

- **Expected:** request ditolak (405), atau pet disimpan dengan `id` = -5.
- **Actual:** 200 dengan id lain, misalnya `{"id":9223372000001082686,"name":"NegativeId","photoUrls":["x"],"tags":[]}`.

---

## Observasi (tidak dihitung sebagai bug)

- Response 404 dari `DELETE /pet/{petId}` untuk id yang tidak ada memiliki body kosong, berbeda dengan response error lain.
- `DELETE /pet/{petId}` bisa dilakukan tanpa `api_key` (sesuai spesifikasi karena header opsional), sehingga client mana pun bisa menghapus pet mana pun.
