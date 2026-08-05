type Props = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "lg";
};

export function ContactPhoto({ name, photoUrl, size = "sm" }: Props) {
  const dim = size === "lg" ? "h-24 w-24" : "h-10 w-10";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        data-testid="contact-photo"
        className={`${dim} rounded-full object-cover ring-2 ring-[var(--accent-soft)]`}
      />
    );
  }

  return (
    <div
      data-testid="contact-photo-fallback"
      className={`${dim} flex items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]`}
    >
      {initials || "?"}
    </div>
  );
}
