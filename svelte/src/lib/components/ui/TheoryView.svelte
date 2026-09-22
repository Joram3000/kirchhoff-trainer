<script lang="ts">
  import TheoryCard from './TheoryCard.svelte';
</script>

<section class="theory">
  <TheoryCard title="Knooppunt, tak en lus">
    <p><b>Knooppunt</b> — een punt waar twee of meer takken samenkomen.</p>
    <p><b>Tak</b> — een enkel element (of serieketen) tussen twee knooppunten.</p>
    <p><b>Lus</b> — elk gesloten pad door het netwerk dat geen knooppunt twee keer bezoekt.</p>
  </TheoryCard>

  <TheoryCard title="Stroomwet van Kirchhoff (KCL)">
    <p>
      De som van alle stromen die een knooppunt <b>in</b> gaan is gelijk aan de som van alle stromen die het
      <b>verlaten</b> — lading kan nergens blijven "plakken".
    </p>
    <div class="formula">Σ I<sub>in</sub> = Σ I<sub>out</sub></div>
    <p>
      Kies zelf een referentierichting per onbekende stroom. Komt er een negatieve waarde uit? Dan loopt de
      werkelijke stroom tegengesteld aan je pijl.
    </p>
  </TheoryCard>

  <TheoryCard title="Spanningswet van Kirchhoff (KVL)">
    <p>Loop je een gesloten lus rond, dan is de som van alle spanningsstijgingen en -dalingen samen nul.</p>
    <div class="formula">Σ V = 0 (rondom een lus)</div>
    <p>
      Doorloop de lus in één richting (bv. met de klok mee). Van − naar + door een element: tel als stijging (+).
      Van + naar −: tel als daling (−).
    </p>
  </TheoryCard>

  <TheoryCard title="Wet van Ohm &amp; vermogen">
    <div class="formula">V = I·R</div>
    <div class="formula">P = V·I = I²·R = V²/R</div>
    <p>
      Bij de passieve tekenconventie kies je de stroom het element in aan de + kant. Positief vermogen: het
      element neemt energie op. Negatief: het levert energie.
    </p>
  </TheoryCard>

  <TheoryCard title="Serie- en parallelschakelingen">
    <div class="formula">R<sub>serie</sub> = R1 + R2 + … + Rn</div>
    <div class="formula">1/R<sub>parallel</sub> = 1/R1 + 1/R2 + … + 1/Rn</div>
    <p>In serie loopt door elk element dezelfde stroom (KCL); parallel staat over elk element dezelfde spanning (KVL).</p>
  </TheoryCard>

  <TheoryCard title="Delers &amp; knooppuntspanning">
    <div class="formula">v<sub>k</sub> = v<sub>s</sub> · R<sub>k</sub> / R<sub>serie</sub></div>
    <div class="formula">i<sub>k</sub> = i<sub>s</sub> · R<sub>parallel</sub> / R<sub>k</sub></div>
    <p>
      Bij de knooppuntspanningsmethode schrijf je in elk knooppunt de KCL-vergelijking op in termen van de
      onbekende knooppuntspanningen en los je het stelsel op.
    </p>
  </TheoryCard>

  <TheoryCard title="Een spannings- én een stroombron samen">
    <p>
      <b>In serie</b> met een weerstand: de stroombron legt de stroom op voor de héle lus. Dus I = I<sub>s</sub>
      — de waarde van R en V<sub>s</sub> doen er voor de stroom niet toe. Gebruik daarna Ohm en KVL om de rest
      te vinden.
    </p>
    <p>
      <b>Parallel</b> met een weerstand: de spanningsbron legt de spanning op voor de héle combinatie. Dus v =
      V<sub>s</sub> — de waarde van R en I<sub>s</sub> doen er voor die spanning niet toe. Gebruik daarna Ohm en
      KCL om de rest te vinden.
    </p>
    <p>
      Dit is precies waarom deze sommen lastig aanvoelen: je moet eerst herkennen wélke bron de stroom of
      spanning al vastlegt, vóór je gaat rekenen.
    </p>
  </TheoryCard>
</section>
