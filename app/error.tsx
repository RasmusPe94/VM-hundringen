"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-900">
      <h1 className="text-lg font-bold">Något gick fel</h1>
      <p className="mt-2 text-sm">{error.message}</p>
      <button
        className="focus-ring mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white"
        onClick={reset}
        type="button"
      >
        Försök igen
      </button>
    </div>
  );
}
