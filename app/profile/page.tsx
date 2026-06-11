import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { uploadAvatarAction, removeAvatarAction } from "./actions";

type ProfilePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { user } = await requireUser();
  const hasAvatar = Boolean(user.avatar_ext);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader title="Min profil" description="Byt din profilbild." />
      <MessageBanner searchParams={searchParams} />

      <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-6">
        {/* Current avatar */}
        <div className="flex flex-col items-center gap-3">
          {hasAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/avatar/${user.id}`}
              alt={user.name}
              width={96}
              height={96}
              className="rounded-full object-cover ring-2 ring-turf"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rim text-3xl font-black text-muted ring-2 ring-border">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="font-bold text-bright text-lg">{user.name}</p>
        </div>

        {/* Upload form */}
        <form action={uploadAvatarAction} className="space-y-4" encType="multipart/form-data">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bright" htmlFor="avatar">
              Ladda upp ny bild
            </label>
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full rounded-md border border-border bg-rim px-3 py-2 text-sm text-bright file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-turf/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-turf"
              id="avatar"
              name="avatar"
              required
              type="file"
            />
            <p className="text-xs text-muted">JPG, PNG, WebP eller GIF · max 5 MB</p>
          </div>
          <SubmitButton pendingText="Laddar upp...">Spara bild</SubmitButton>
        </form>

        {/* Remove avatar */}
        {hasAvatar && (
          <form action={removeAvatarAction}>
            <SubmitButton variant="danger" pendingText="Tar bort...">
              Ta bort profilbild
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
