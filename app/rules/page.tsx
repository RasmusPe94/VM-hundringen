import { PageHeader } from "@/components/page-header";

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Reglerna är skrivna för att matcha den gamla Excel/Google Sheets-modellen."
        title="Regler"
      />
      <section className="space-y-4 rounded-md border border-neutral-200 bg-white p-5 text-sm leading-7 shadow-soft">
        <h2 className="text-lg font-bold text-ink">VM 1000 2026</h2>
        <p>
          Varje deltagare startar med 100 SEK. Alla spel läggs i appen och är
          synliga för alla deltagare i tävlingen.
        </p>
        <p>
          När ett spel läggs dras insatsen direkt från spelarens saldo. Spel som
          fortfarande är pågående räknas som pending stake och visar möjlig vinst.
        </p>
        <p>
          Decimalodds används. Om ett spel vinner är vinstbeloppet insats gånger
          odds. Vinst betyder alltså utbetalning inklusive den ursprungliga
          insatsen, precis som i Excel-filen.
        </p>
        <p>
          Om ett spel förlorar är vinsten 0 SEK. Om ett spel voidas betalas
          insatsen tillbaka som vinst.
        </p>
        <p>
          Ledaren är den deltagare som har högst saldo. Slutlig vinnare är den
          spelare som har högst saldo efter finalen när alla spel är avgjorda.
        </p>
        <p>
          Admin ansvarar för att skapa matcher och avgöra spel. Deltagare kan
          bara ändra eller ta bort egna spel så länge de är pågående.
        </p>
      </section>
    </div>
  );
}
