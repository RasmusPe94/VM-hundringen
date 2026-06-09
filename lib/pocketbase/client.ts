import { cookies } from "next/headers";
import { getPocketBaseEnv } from "@/lib/env";

export const PB_AUTH_COOKIE = "vm_pb_auth";

type FetchOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
};

type PocketBaseErrorBody = {
  data?: Record<string, { message?: string }>;
  message?: string;
};

export type PocketBaseList<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export class PocketBaseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function getAuthToken() {
  return cookies().get(PB_AUTH_COOKIE)?.value ?? null;
}

export function setAuthToken(token: string) {
  cookies().set(PB_AUTH_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAuthToken() {
  cookies().delete(PB_AUTH_COOKIE);
}

function buildUrl(path: string, params?: FetchOptions["params"]) {
  const { url } = getPocketBaseEnv();
  const target = new URL(path, `${url}/`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      target.searchParams.set(key, String(value));
    }
  }

  return target;
}

function errorMessage(body: PocketBaseErrorBody, fallback: string) {
  const detail = Object.values(body.data ?? {})
    .map((item) => item.message)
    .filter(Boolean)
    .join(" ");

  return detail || body.message || fallback;
}

export async function pbFetch<T>(path: string, options: FetchOptions = {}) {
  const token = options.token === undefined ? getAuthToken() : options.token;
  const response = await fetch(buildUrl(path, options.params), {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    method: options.method ?? "GET"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as PocketBaseErrorBody;
    throw new PocketBaseError(
      errorMessage(body, `PocketBase svarade med ${response.status}.`),
      response.status
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function listRecords<T>(
  collection: string,
  params?: FetchOptions["params"]
) {
  return pbFetch<PocketBaseList<T>>(
    `/api/collections/${collection}/records`,
    {
      params: {
        page: 1,
        perPage: 500,
        ...params
      }
    }
  );
}

export async function getAllRecords<T>(
  collection: string,
  params?: FetchOptions["params"]
) {
  const firstPage = await listRecords<T>(collection, params);
  const items = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await listRecords<T>(collection, {
      ...params,
      page
    });
    items.push(...nextPage.items);
  }

  return items;
}

export async function createRecord<T>(collection: string, body: unknown) {
  return pbFetch<T>(`/api/collections/${collection}/records`, {
    body,
    method: "POST"
  });
}

export async function updateRecord<T>(
  collection: string,
  id: string,
  body: unknown
) {
  return pbFetch<T>(`/api/collections/${collection}/records/${id}`, {
    body,
    method: "PATCH"
  });
}

export async function deleteRecord(collection: string, id: string) {
  return pbFetch<null>(`/api/collections/${collection}/records/${id}`, {
    method: "DELETE"
  });
}

export function filterValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
