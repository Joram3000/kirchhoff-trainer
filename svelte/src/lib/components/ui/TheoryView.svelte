<script lang="ts">
  import TheoryCard from './TheoryCard.svelte';
</script>

<section class="theory">
  <h2 class="theory-heading" data-week="A–B">Week A–B · Kirchhoff, Ohm en vermogen</h2>

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

  <TheoryCard title="Wet van Ohm, lading en energie">
    <div class="formula">U = I·R &nbsp;·&nbsp; G = 1/R</div>
    <div class="formula">P = U·I = I²·R = U²/R</div>
    <div class="formula">Q = I·t &nbsp;·&nbsp; E = P·t = U·Q</div>
    <p>Rendement: η = P<sub>uit</sub>/P<sub>in</sub> · 100%.</p>
  </TheoryCard>

  <TheoryCard title="Vermogen: geleverd of opgenomen?">
    <p>
      Gebruik de <b>passieve tekenconventie</b>: kijk waar de stroom het element binnenkomt ten opzichte van de +
      van de spanning.
    </p>
    <p>
      <b>Stroom gaat de + kant in</b> → het element <b>neemt op</b>: P = +U·I (weerstanden altijd).<br />
      <b>Stroom komt er aan de + kant uit</b> → het element <b>levert</b>: P = −U·I.
    </p>
    <p>
      Controle: de som van alle vermogens is nul — wat de bronnen leveren, nemen de andere elementen op. Een bron
      kan dus ook vermogen <i>opnemen</i> (bv. een accu die wordt opgeladen).
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
  </TheoryCard>

  <h2 class="theory-heading" data-week="C">Week C · Weerstandsnetwerken</h2>

  <TheoryCard title="Serie- en parallelschakelingen">
    <div class="formula">R<sub>serie</sub> = R1 + R2 + … + Rn</div>
    <div class="formula">1/R<sub>parallel</sub> = 1/R1 + 1/R2 + … + 1/Rn</div>
    <div class="formula">R1 ∥ R2 = R1·R2 / (R1 + R2)</div>
    <p>In serie loopt door elk element dezelfde stroom (KCL); parallel staat over elk element dezelfde spanning (KVL).</p>
  </TheoryCard>

  <TheoryCard title="Spannings- en stroomdeler">
    <div class="formula">v<sub>k</sub> = v<sub>s</sub> · R<sub>k</sub> / R<sub>serie</sub></div>
    <div class="formula">i<sub>1</sub> = i<sub>s</sub> · R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)</div>
    <p>
      Let op bij de stroomdeler: door R<sub>1</sub> gaat het deel met de <b>andere</b> weerstand in de teller. Met
      geleidbaarheden: i<sub>k</sub> = i<sub>s</sub> · G<sub>k</sub> / (G<sub>1</sub> + … + G<sub>n</sub>).
    </p>
  </TheoryCard>

  <TheoryCard title="Vervangingsweerstand bepalen">
    <p>
      <b>1.</b> Begin het <b>verst van de klemmen</b> en combineer steeds twee weerstanden die zuiver in serie of
      parallel staan. <b>2.</b> Teken het schema opnieuw na elke stap. <b>3.</b> Werk zo naar de klemmen a-b toe.
    </p>
    <p>
      <b>Terugrekenen</b> (R<sub>ab</sub> gegeven, één R onbekend): pel het netwerk af <b>vanaf de klemmen</b>. Staat
      er een weerstand in serie vooraan, trek hem af. Staat er een weerstand parallel, gebruik
    </p>
    <div class="formula">1/R<sub>rest</sub> = 1/R<sub>totaal</sub> − 1/R<sub>parallel</sub></div>
  </TheoryCard>

  <TheoryCard title="Spanningsdeler met een schakelaar">
    <p>
      Krijg je twee metingen (schakelaar open en dicht)? Gebruik ze één voor één. Met de schakelaar open is er een
      gewone spanningsdeler — los daaruit de eerste onbekende op. Met de schakelaar dicht komt er een weerstand
      parallel bij: bepaal eerst de parallelwaarde uit de deler, en reken dan terug naar die ene weerstand.
    </p>
  </TheoryCard>

  <h2 class="theory-heading" data-week="D">Week D · Knooppuntspanningsmethode</h2>

  <TheoryCard title="Knooppuntspanningsmethode">
    <p>
      <b>1.</b> Kies een referentieknoop (massa), bij voorkeur aan één kant van een spanningsbron — dan is die
      knooppuntspanning meteen bekend. Geef de overige knopen een spanning v<sub>1</sub>, v<sub>2</sub>, …
    </p>
    <p>
      <b>2.</b> Schrijf KCL per knoop: som van de stromen die de knoop <b>verlaten</b> = bronstroom die erin gaat.
      De stroom van knoop n naar knoop k door R is:
    </p>
    <div class="formula">i = (v<sub>n</sub> − v<sub>k</sub>) / R</div>
    <p>
      <b>3.</b> Zit er een spanningsbron <b>tussen</b> twee knopen? Teken een <b>supernode</b> eromheen en schrijf
      KCL voor dat gesloten oppervlak, plus een KVL-vergelijking over de bron (bv. v<sub>1</sub> − v<sub>2</sub> =
      V<sub>s</sub>). Gebruik nooit álle knopen voor KCL, anders krijg je afhankelijke vergelijkingen.
    </p>
    <p>
      <b>4.</b> Gestuurde bron? Schrijf eerst op alsof het een gewone bron is, druk daarna de stuurgrootheid uit in
      knooppuntspanningen en vul in.
    </p>
  </TheoryCard>

  <TheoryCard title="Het stelsel oplossen">
    <p>
      <b>1.</b> Zet elke vergelijking in standaardvorm: de onbekenden links, de bekende getallen rechts.
    </p>
    <p>
      <b>2.</b> Druk één onbekende uit in de andere (bv. v<sub>2</sub> in v<sub>3</sub>) en vul die in bij de andere
      vergelijking. Dan houd je één vergelijking met één onbekende over.
    </p>
    <p><b>3.</b> Los die op, en vul het antwoord terug in om de andere onbekende te vinden.</p>
    <p>
      Op het tentamen: is één knooppuntspanning al gegeven, dan houd je twee vergelijkingen met twee onbekenden over.
      Controleer je antwoord door het in KCL van een knooppunt in te vullen.
    </p>
  </TheoryCard>

  <h2 class="theory-heading" data-week="E–F">Week E–F · Netwerktheorema’s</h2>

  <TheoryCard title="Thévenin- en Norton-equivalent">
    <p>
      Elk lineair netwerk met twee klemmen a-b gedraagt zich naar buiten als een spanningsbron V<sub>t</sub> in serie
      met R<sub>t</sub> (Thévenin), óf als een stroombron I<sub>n</sub> parallel aan R<sub>t</sub> (Norton).
    </p>
    <div class="formula">V<sub>t</sub> = v<sub>open</sub> &nbsp;·&nbsp; I<sub>n</sub> = i<sub>kortsluit</sub></div>
    <div class="formula">V<sub>t</sub> = I<sub>n</sub> · R<sub>t</sub></div>
    <p>
      Je hebt er altijd maar twee van de drie nodig; de derde volgt uit V<sub>t</sub> = I<sub>n</sub>·R<sub>t</sub>.
      Kies de makkelijkste — vaak is dat de kortsluitstroom.
    </p>
  </TheoryCard>

  <TheoryCard title="Thévenin-weerstand: bronnen uitschakelen">
    <p>Bepaal de vervangingsweerstand "vanuit het oog" bij de klemmen, met alle onafhankelijke bronnen uit:</p>
    <p>
      <b>Spanningsbron uit</b> → 0 V → <b>kortsluiting</b> (draadje).<br />
      <b>Stroombron uit</b> → 0 A → <b>open</b> (weghalen).
    </p>
    <p>
      Uit een meting: open klemspanning V<sub>t</sub> en spanning v<sub>L</sub> met belasting R<sub>L</sub> geven
      R<sub>t</sub> = (V<sub>t</sub> − v<sub>L</sub>) / (v<sub>L</sub>/R<sub>L</sub>).
    </p>
  </TheoryCard>

  <TheoryCard title="Maximale vermogensoverdracht">
    <p>
      <b>1.</b> Maak het Thévenin-equivalent (V<sub>t</sub>, R<sub>t</sub>). <b>2.</b> Het vermogen in de belasting is
      maximaal als
    </p>
    <div class="formula">R<sub>L</sub> = R<sub>t</sub></div>
    <div class="formula">P<sub>max</sub> = V<sub>t</sub>² / (4·R<sub>t</sub>)</div>
    <p>
      De stroom is dan de helft van de kortsluitstroom en het rendement maar 50%. Ligt R<sub>t</sub> vast en kies je
      R<sub>L</sub>, dan geldt R<sub>L</sub> = R<sub>t</sub>. Ligt R<sub>L</sub> vast en kies je R<sub>t</sub>, dan is
      R<sub>t</sub> = 0 het best (strikvraag P2.91).
    </p>
  </TheoryCard>

  <TheoryCard title="Superpositie">
    <p>Bevat een lineair netwerk meer bronnen, dan mag je de effecten van de bronnen afzonderlijk optellen.</p>
    <p>
      <b>1.</b> Laat één bron aan; zet de rest uit (spanningsbron <b>kortsluiten</b>, stroombron <b>openen</b>).
      <b>2.</b> Bereken de bijdrage met serie/parallel, spanningsdeler of stroomdeler. <b>3.</b> Herhaal voor elke
      bron. <b>4.</b> Tel de bijdragen op, met teken t.o.v. dezelfde referentierichting.
    </p>
    <p>
      Alleen voor stromen en spanningen in <b>lineaire</b> netwerken — vermogen kun je niet superponeren (P = I²R is
      niet lineair).
    </p>
  </TheoryCard>
</section>
