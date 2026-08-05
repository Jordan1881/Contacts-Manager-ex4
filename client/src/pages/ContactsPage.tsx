import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ApiError,
  createContact,
  deleteContact,
  listContacts,
  toggleFavorite,
} from "../lib/api";
import type { Contact, ContactInput, FieldError } from "../lib/types";
import { ContactForm } from "../components/ContactForm";
import { ContactListEmpty } from "../components/ContactListEmpty";
import { ContactPhoto } from "../components/ContactPhoto";
import { DeleteContactDialog } from "../components/DeleteContactDialog";
import { FavoriteToggle } from "../components/FavoriteToggle";

const LIMIT = 20;

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<FieldError[]>();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [favBusy, setFavBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listContacts({
        q: q || undefined,
        favorite: favoritesOnly || undefined,
        page,
        limit: LIMIT,
      });
      setContacts(res.data);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [q, favoritesOnly, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(data: ContactInput) {
    setCreating(true);
    setCreateErrors(undefined);
    try {
      await createContact(data);
      toast.success("Contact created");
      setShowCreate(false);
      setPage(1);
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateErrors(err.details);
        toast.error(err.message);
      } else {
        toast.error("Create failed");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleFavorite(contact: Contact) {
    const prev = contact.isFavorite;
    setContacts((list) =>
      list.map((c) =>
        c.id === contact.id ? { ...c, isFavorite: !c.isFavorite } : c,
      ),
    );
    setFavBusy(contact.id);
    try {
      const updated = await toggleFavorite(contact.id);
      setContacts((list) =>
        list.map((c) => (c.id === contact.id ? updated : c)),
      );
    } catch (err) {
      setContacts((list) =>
        list.map((c) =>
          c.id === contact.id ? { ...c, isFavorite: prev } : c,
        ),
      );
      toast.error(err instanceof Error ? err.message : "Favorite failed");
    } finally {
      setFavBusy(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContact(deleteTarget.id);
      toast.success("Contact deleted");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const emptyKind = q || favoritesOnly ? "search" : "empty";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-left">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
          Contacts Manager
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--ink)]">
          Your phone book
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Create, search, and manage contacts. Data persists in SQLite.
        </p>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2"
          placeholder="Search name, phone, email…"
          value={qDraft}
          data-testid="input-search"
          onChange={(e) => setQDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              setQ(qDraft.trim());
            }
          }}
        />
        <button
          type="button"
          data-testid="btn-search"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white"
          onClick={() => {
            setPage(1);
            setQ(qDraft.trim());
          }}
        >
          Search
        </button>
        <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
          <input
            type="checkbox"
            checked={favoritesOnly}
            data-testid="filter-favorites"
            onChange={(e) => {
              setPage(1);
              setFavoritesOnly(e.target.checked);
            }}
          />
          Favorites only
        </label>
        <button
          type="button"
          data-testid="btn-show-create"
          className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Hide form" : "Add contact"}
        </button>
      </div>

      {showCreate && (
        <section className="mb-8 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">New contact</h2>
          <ContactForm
            mode="create"
            includePhoto
            loading={creating}
            fieldErrors={createErrors}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </section>
      )}

      {loading ? (
        <p className="text-[var(--muted)]">Loading…</p>
      ) : contacts.length === 0 ? (
        <ContactListEmpty kind={emptyKind} />
      ) : (
        <ul className="space-y-2" data-testid="contact-list">
          {contacts.map((c) => (
            <li
              key={c.id}
              data-testid="contact-row"
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm"
            >
              <ContactPhoto name={c.name} photoUrl={c.photoUrl} />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/contacts/${c.id}`}
                  className="font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                  data-testid="link-contact"
                >
                  {c.name}
                </Link>
                <p className="truncate text-sm text-[var(--muted)]">{c.phone}</p>
              </div>
              <FavoriteToggle
                isFavorite={c.isFavorite}
                loading={favBusy === c.id}
                onToggle={() => void handleFavorite(c)}
              />
              <button
                type="button"
                data-testid="btn-delete"
                className="text-sm text-[var(--danger)]"
                onClick={() => setDeleteTarget(c)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-[var(--muted)]">
          <span data-testid="list-total">
            {total} contact{total === 1 ? "" : "s"} · page {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              data-testid="btn-prev"
              className="rounded border border-[var(--border)] bg-white px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              data-testid="btn-next"
              className="rounded border border-[var(--border)] bg-white px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <DeleteContactDialog
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
