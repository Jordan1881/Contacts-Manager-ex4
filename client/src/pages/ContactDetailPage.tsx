import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ApiError,
  deleteContact,
  getContact,
  patchContact,
  toggleFavorite,
} from "../lib/api";
import type { Contact, ContactInput, FieldError } from "../lib/types";
import { ContactForm } from "../components/ContactForm";
import { ContactPhoto } from "../components/ContactPhoto";
import { DeleteContactDialog } from "../components/DeleteContactDialog";
import { FavoriteToggle } from "../components/FavoriteToggle";

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getContact(id)
      .then(setContact)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Not found");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSave(data: ContactInput) {
    if (!id) return;
    setSaving(true);
    setFieldErrors(undefined);
    try {
      const updated = await patchContact(id, data);
      setContact(updated);
      toast.success("Contact updated");
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.details);
        toast.error(err.message);
      } else {
        toast.error("Update failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleFavorite() {
    if (!contact) return;
    const prev = contact.isFavorite;
    setContact({ ...contact, isFavorite: !prev });
    setFavBusy(true);
    try {
      const updated = await toggleFavorite(contact.id);
      setContact(updated);
    } catch (err) {
      setContact({ ...contact, isFavorite: prev });
      toast.error(err instanceof Error ? err.message : "Favorite failed");
    } finally {
      setFavBusy(false);
    }
  }

  async function handleDelete() {
    if (!contact) return;
    setDeleting(true);
    try {
      await deleteContact(contact.id);
      toast.success("Contact deleted");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !contact) {
    return <p className="p-10 text-[var(--muted)]">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-left">
      <Link to="/" className="text-sm text-[var(--accent)]" data-testid="link-back">
        ← Back to list
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <ContactPhoto name={contact.name} photoUrl={contact.photoUrl} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold" data-testid="detail-name">
              {contact.name}
            </h1>
            <FavoriteToggle
              isFavorite={contact.isFavorite}
              loading={favBusy}
              onToggle={() => void handleFavorite()}
            />
          </div>
          <p className="text-[var(--muted)]">{contact.phone}</p>
          <button
            type="button"
            className="mt-3 text-sm text-[var(--danger)]"
            data-testid="btn-delete-detail"
            onClick={() => setDeleteOpen(true)}
          >
            Delete contact
          </button>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Edit</h2>
        <ContactForm
          mode="edit"
          initial={contact}
          includePhoto
          loading={saving}
          fieldErrors={fieldErrors}
          onSubmit={handleSave}
        />
      </section>

      <DeleteContactDialog
        open={deleteOpen}
        name={contact.name}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
