import VatCalculator from "@/components/vat-calculator"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <VatCalculator />
      </div>
    </main>
  )
}
