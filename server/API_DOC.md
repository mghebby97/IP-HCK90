# API Documentation

Base URL: `http://localhost:3001` (sesuaikan `PORT` pada `.env`)

Authentication: beberapa endpoint membutuhkan header `Authorization: Bearer <access_token>` (JWT).

**Daftar Endpoints**

- **Auth / User**

  - POST /register

    - Deskripsi: Registrasi user baru.
    - Body (application/json):
      - `full_name` (string, required)
      - `email` (string, required)
      - `password` (string, required)
    - Contoh respons (201):
      ```json
      {
        "message": "Registration successful",
        "user": {
          "id": 1,
          "full_name": "Nama",
          "email": "a@b.com",
          "profile_photo": null
        }
      }
      ```

  - POST /login

    - Deskripsi: Login dan menerima `access_token`.
    - Body (application/json):
      - `email` (string, required)
      - `password` (string, required)
    - Contoh respons (200):
      ```json
      { "access_token": "<jwt-token>" }
      ```

  - POST /google-login

    - Deskripsi: Login / register via Google OAuth token.
    - Body (application/json):
      - `token` (string, required) — ID token dari Google client.
    - Contoh respons (200):
      ```json
      {
        "access_token": "<jwt-token>",
        "user": {
          "id": 1,
          "full_name": "Nama",
          "email": "a@b.com",
          "profile_photo": null
        }
      }
      ```

  - GET /profile

    - Deskripsi: Ambil profil user saat ini.
    - Auth: required
    - Header: `Authorization: Bearer <token>`
    - Respons (200): objek user:
      ```json
      {
        "id": 1,
        "full_name": "Nama",
        "email": "a@b.com",
        "profile_photo": null,
        "createdAt": "..."
      }
      ```

  - PATCH /profile/photo
    - Deskripsi: Upload / update profile photo.
    - Auth: required
    - Header: `Authorization: Bearer <token>`
    - Content-Type: `multipart/form-data` (field name: `photo`)
    - Respons (200):
      ```json
      {
        "message": "Profile photo updated successfully",
        "profile_photo": "<url_or_dataURI>"
      }
      ```

- **News**

  - GET /news

    - Deskripsi: Ambil list berita (menggunakan GNews API; fallback mock data saat API tidak tersedia).
    - Query params:
      - `category` (string, default: `general`)
      - `lang` (string, default: `en`)
      - `max` (number, default: `100`, max pada client-side dibatasi)
      - `page` (number, default: `1`)
      - `country` (string, default: `id`)
    - Respons (200):
      ```json
      {
        "totalArticles": 123,
        "articles": [
          {
            "title": "...",
            "description": "...",
            "url": "...",
            "image": "...",
            "publishedAt": "...",
            "source": { "name": "..." }
          }
        ]
      }
      ```

  - GET /news/detail
    - Deskripsi: Endpoint helper untuk meneruskan `url` artikel (tidak mengembalikan isi penuh dari sumber eksternal).
    - Query params:
      - `url` (string, required)
    - Respons (200):
      ```json
      {
        "message": "Use the article URL to view the full article",
        "url": "<url>"
      }
      ```

- **Favorites** (semua route di bawah memerlukan autentikasi)

  - GET /favorites/

    - Deskripsi: Ambil daftar favorite milik user.
    - Auth: required
    - Respons (200): array objek favorite termasuk relasi `User` kecil.

  - POST /favorites/

    - Deskripsi: Tambah artikel ke favorites.
    - Auth: required
    - Body (application/json): minimal diperlukan:
      - `article_id` (string, required)
      - `title` (string, required)
    - Optional fields: `description`, `content`, `url`, `image_url`, `published_at`, `lang`, `source_id`, `source_name`, `source_url`, `source_country`.
    - Respons (201):
      ```json
      {
        "message": "Article added to favorites",
        "favorite": { "id": 1, "article_id": "...", "title": "..." }
      }
      ```

  - DELETE /favorites/:id
    - Deskripsi: Hapus favorite berdasarkan `id` (ID favorite, bukan `article_id`).
    - Auth: required
    - Params: `id` (favorite id)
    - Respons (200):
      ```json
      { "message": "Article removed from favorites" }
      ```

- **AI** (semua route di bawah `/ai` memerlukan autentikasi)
  - POST /ai/analyze
    - Deskripsi: Minta analisis AI (summarize / analyze / sentiment / factcheck) terhadap artikel.
    - Auth: required
    - Header: `Authorization: Bearer <token>`
    - Body (application/json): salah satu dari `title`, `content`, `description` harus diberikan. Field tambahan:
      - `action` (string) — salah satu: `summarize` (default), `analyze`, `sentiment`, `factcheck`.
    - Contoh body:
      ```json
      { "title": "...", "content": "...", "action": "summarize" }
      ```
    - Respons (200):
      ```json
      {
        "action": "summarize",
        "analysis": "<hasil teks>",
        "article": { "title": "...", "description": "..." }
      }
      ```
    - Catatan: Jika environment variable `GEMINI_API_KEY` tidak tersedia atau request ke layanan AI gagal, server memberikan fallback analysis (demo) dengan status 200 dan `note` yang menjelaskan fallback.

**Header umum**

- Untuk route yang membutuhkan autentikasi sertakan: `Authorization: Bearer <access_token>`
- Content-Type sesuai payload: `application/json` untuk body JSON, `multipart/form-data` untuk upload photo.

**Kode status umum**

- 200 OK — permintaan berhasil.
- 201 Created — resource berhasil dibuat.
- 400 Bad Request — parameter/body tidak valid atau hilang.
- 401 Unauthorized — token tidak ada/invalid (dihasilkan oleh middleware auth).
- 404 Not Found — resource tidak ditemukan.
- 500 Internal Server Error — kesalahan server / eksternal.

**Mount points (route base)**

- `GET /news`, `GET /news/detail`, `POST /register`, `POST /login`, `POST /google-login`, `GET /profile`, `PATCH /profile/photo` are mounted at root (`/`).
- `/favorites` routes are mounted under `/favorites`.
- `/ai` routes are mounted under `/ai`.

Untuk detail implementasi lihat controller terkait di folder `server/controllers`.


