type Props = {
  isFavorite: boolean;
  loading?: boolean;
  onToggle: () => void;
};

export function FavoriteToggle({ isFavorite, loading, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-label={isFavorite ? "Unfavorite" : "Favorite"}
      data-testid="btn-favorite"
      disabled={loading}
      onClick={onToggle}
      className="rounded-full p-2 text-xl leading-none transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
