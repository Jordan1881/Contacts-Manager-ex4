import type {
  ApiErrorBody,
  Contact,
  ContactInput,
  ContactListResponse,
} from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  details?: ApiErrorBody["details"];

  constructor(status: number, body: ApiErrorBody) {
    super(body.error);
    this.status = status;
    this.details = body.details;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => ({ error: "Unexpected response" }));

  if (!res.ok) {
    throw new ApiError(res.status, body as ApiErrorBody);
  }

  return body as T;
}

export type ListParams = {
  q?: string;
  favorite?: boolean;
  page?: number;
  limit?: number;
};

export function listContacts(params: ListParams = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.favorite) sp.set("favorite", "true");
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return request<ContactListResponse>(`/api/contacts${qs ? `?${qs}` : ""}`);
}

export function getContact(id: string) {
  return request<Contact>(`/api/contacts/${id}`);
}

export function createContact(data: ContactInput) {
  return request<Contact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function putContact(id: string, data: ContactInput) {
  return request<Contact>(`/api/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function patchContact(id: string, data: Partial<ContactInput>) {
  return request<Contact>(`/api/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function toggleFavorite(id: string) {
  return request<Contact>(`/api/contacts/${id}/favorite`, {
    method: "PATCH",
  });
}

export function deleteContact(id: string) {
  return request<void>(`/api/contacts/${id}`, { method: "DELETE" });
}
