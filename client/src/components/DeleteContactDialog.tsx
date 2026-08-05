type Props = {
  open: boolean;
  name: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteContactDialog({
  open,
  name,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      data-testid="delete-dialog"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Delete contact?</h2>
        <p className="mt-2 text-[var(--muted)]">
          This permanently removes <strong>{name}</strong>. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            data-testid="btn-delete-cancel"
            className="rounded-lg border border-[var(--border)] px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            data-testid="btn-delete-confirm"
            className="rounded-lg bg-[var(--danger)] px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
