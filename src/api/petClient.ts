import { APIRequestContext, APIResponse } from '@playwright/test';

export class PetClient {
  constructor(private readonly request: APIRequestContext) {}

  addPet(body: unknown): Promise<APIResponse> {
    return this.request.post('pet', { data: body });
  }

  /**
   * Body dikirim sebagai Buffer agar tidak di-encode ulang oleh Playwright,
   * sehingga JSON rusak tetap terkirim apa adanya.
   */
  addPetRaw(rawBody: string, contentType = 'application/json'): Promise<APIResponse> {
    return this.request.post('pet', {
      data: Buffer.from(rawBody, 'utf-8'),
      headers: { 'Content-Type': contentType },
    });
  }

  getPet(petId: number | string): Promise<APIResponse> {
    return this.request.get(`pet/${petId}`);
  }

  /** Format query sesuai spec: ?status=a&status=b. Gunakan `rawQuery` untuk edge case. */
  findByStatus(statuses: string[], options: { rawQuery?: string; accept?: string } = {}): Promise<APIResponse> {
    const query =
      options.rawQuery ?? statuses.map((s) => `status=${encodeURIComponent(s)}`).join('&');
    const url = query ? `pet/findByStatus?${query}` : 'pet/findByStatus';
    return this.request.get(url, options.accept ? { headers: { Accept: options.accept } } : undefined);
  }

  deletePet(petId: number | string, apiKey?: string): Promise<APIResponse> {
    return this.request.delete(`pet/${petId}`, apiKey ? { headers: { api_key: apiKey } } : undefined);
  }
}
