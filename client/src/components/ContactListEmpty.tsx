type Props = {
  kind: "empty" | "search";
};

export function ContactListEmpty({ kind }: Props) {
  return (
    <div
      data-testid="list-empty"
      className="rounded-xl border border-dashed border-[var(--border)] bg-white/70 px-6 py-12 text-center text-[var(--muted)]"
    >
      {kind === "empty"
        ? "No contacts yet. Add your first contact below."
        : "No contacts match your search or filters."}
    </div>
  );
}
