import { redirect } from "next/navigation";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { getUserProfile } from "@/lib/auth";
import { signInAction } from "./actions";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user } = await getUserProfile();

  if (user) {
    redirect("/leaderboard");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        description="Logga in med användarnamn och lösenord. Ingen e-post behövs."
        title="Logga in"
      />
      <MessageBanner searchParams={searchParams} />
      <form
        action={signInAction}
        className="space-y-4 rounded-md border border-neutral-200 bg-white p-5 shadow-soft"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-neutral-800"
            htmlFor="username"
          >
            Användare
          </label>
          <input
            autoComplete="username"
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            id="username"
            name="username"
            placeholder="till exempel kalle"
            required
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-neutral-800"
            htmlFor="password"
          >
            Lösenord
          </label>
          <input
            autoComplete="current-password"
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>
        <SubmitButton pendingText="Loggar in...">Logga in</SubmitButton>
      </form>
    </div>
  );
}
