import TrendsChart from "@/app/(dashboard)/charts/TrendsChart";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-5xl flex-col gap-8 py-12 px-6">
        <h1 className="text-2xl font-semibold">MileTracker Dashboard</h1>
        <section>
          <h2 className="mb-2 text-lg font-medium">Tendências do Milheiro</h2>
          <TrendsChart />
        </section>
      </main>
    </div>
  );
}
