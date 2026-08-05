export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  birthday: string | null;
  notes: string | null;
  photoUrl: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactListResponse = {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
};

export type FieldError = { field: string; message: string };

export type ApiErrorBody = {
  error: string;
  details?: FieldError[];
};

export type ContactInput = {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  birthday?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  isFavorite?: boolean;
};
