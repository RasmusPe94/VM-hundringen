import { EmptyState } from "@/components/empty-state";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listPlayers } from "@/lib/db/data";
import { deleteUserAction, updateUserAction } from "./actions";

type AdminUsersPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();
  const players = await listPlayers();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Ändra namn eller ta bort spelare som inte längre deltar."
        title="Admin: spelare"
      />
      <MessageBanner searchParams={searchParams} />
      {players.length === 0 ? (
        <EmptyState text="Inga spelare hittades." title="Tom lista" />
      ) : (
        <div className="space-y-4">
          {players.map((p) => (
            <section
              className="rounded-lg border border-border bg-surface p-4 shadow-card"
              key={p.id}
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <form action={updateUserAction} className="flex gap-4">
                  <input name="id" type="hidden" value={p.id} />
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-bright" htmlFor={`name_${p.id}`}>
                      Namn
                    </label>
                    <input
                      className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                      defaultValue={p.name}
                      id={`name_${p.id}`}
                      name="display_name"
                      required
                      type="text"
                    />
                  </div>
                  <div className="flex items-end">
                    <SubmitButton pendingText="Sparar...">Spara</SubmitButton>
                  </div>
                </form>
                <form action={deleteUserAction} className="flex items-end">
                  <input name="id" type="hidden" value={p.id} />
                  <SubmitButton className="w-full lg:w-auto" pendingText="Tar bort..." variant="danger">
                    Ta bort
                  </SubmitButton>
                </form>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
