import { useEffect, useState } from "react";
import type { Contact, ContactInput, FieldError } from "../lib/types";

const emptyForm: ContactInput = {
  name: "",
  phone: "",
  email: "",
  address: "",
  birthday: "",
  notes: "",
  photoUrl: "",
};

type Props = {
  mode: "create" | "edit";
  initial?: Contact | null;
  includePhoto?: boolean;
  loading?: boolean;
  fieldErrors?: FieldError[];
  onSubmit: (data: ContactInput) => Promise<void> | void;
  onCancel?: () => void;
};

function fieldMsg(errors: FieldError[] | undefined, field: string) {
  return errors?.find((e) => e.field === field || e.field.endsWith(field))
    ?.message;
}

export function ContactForm({
  mode,
  initial,
  includePhoto = false,
  loading,
  fieldErrors,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<ContactInput>(() =>
    initial
      ? {
          name: initial.name,
          phone: initial.phone,
          email: initial.email ?? "",
          address: initial.address ?? "",
          birthday: initial.birthday ?? "",
          notes: initial.notes ?? "",
          photoUrl: initial.photoUrl ?? "",
        }
      : { ...emptyForm },
  );

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        phone: initial.phone,
        email: initial.email ?? "",
        address: initial.address ?? "",
        birthday: initial.birthday ?? "",
        notes: initial.notes ?? "",
        photoUrl: initial.photoUrl ?? "",
      });
    }
  }, [initial]);

  function update<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: ContactInput = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.toString().trim() || null,
      address: form.address?.toString().trim() || null,
      birthday: form.birthday?.toString().trim() || null,
      notes: form.notes?.toString().trim() || null,
    };
    if (includePhoto) {
      payload.photoUrl = form.photoUrl?.toString().trim() || null;
    }
    await onSubmit(payload);
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      <Field label="Name" required error={fieldMsg(fieldErrors, "name")}>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          data-testid="input-name"
        />
      </Field>
      <Field label="Phone" required error={fieldMsg(fieldErrors, "phone")}>
        <input
          className={inputClass}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          data-testid="input-phone"
        />
      </Field>
      <Field label="Email" error={fieldMsg(fieldErrors, "email")}>
        <input
          type="email"
          className={inputClass}
          value={form.email ?? ""}
          onChange={(e) => update("email", e.target.value)}
          data-testid="input-email"
        />
      </Field>
      <Field label="Address" error={fieldMsg(fieldErrors, "address")}>
        <input
          className={inputClass}
          value={form.address ?? ""}
          onChange={(e) => update("address", e.target.value)}
          data-testid="input-address"
        />
      </Field>
      <Field label="Birthday" error={fieldMsg(fieldErrors, "birthday")}>
        <input
          type="date"
          className={inputClass}
          value={form.birthday ?? ""}
          onChange={(e) => update("birthday", e.target.value)}
          data-testid="input-birthday"
        />
      </Field>
      <Field label="Notes" error={fieldMsg(fieldErrors, "notes")}>
        <textarea
          className={inputClass}
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          data-testid="input-notes"
        />
      </Field>
      {includePhoto && (
        <Field label="Photo URL" error={fieldMsg(fieldErrors, "photoUrl")}>
          <input
            className={inputClass}
            value={form.photoUrl ?? ""}
            onChange={(e) => update("photoUrl", e.target.value)}
            placeholder="https://…"
            data-testid="input-photoUrl"
          />
        </Field>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          data-testid="btn-submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Add contact"
              : "Save changes"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--muted)]">
        {mode === "edit"
          ? "Edits save via PATCH (partial update)."
          : "Name and phone are required."}
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-[var(--ink)]">
      {label}
      {required ? <span className="text-[var(--danger)]"> *</span> : null}
      {children}
      {error ? (
        <span className="mt-1 block text-sm text-[var(--danger)]">{error}</span>
      ) : null}
    </label>
  );
}
