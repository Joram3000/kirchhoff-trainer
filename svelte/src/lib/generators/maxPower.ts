import type { Problem } from '../types';
import { pick } from '../utils/random';
import { fmt } from '../utils/format';
import { difficultyLevel } from '../utils/difficulty';
import { variant, problemFrom, type Built } from './built';
import { buildTwoTerminal, type TwoTerminal } from './thevenin';

const RULE =
  `Maximale vermogensoverdracht: maak eerst het Thévenin-equivalent (V<sub>t</sub>, R<sub>t</sub>). Het vermogen in R<sub>L</sub> is maximaal als <b>R<sub>L</sub> = R<sub>t</sub></b>, en dan is P<sub>max</sub> = V<sub>t</sub>²/(4·R<sub>t</sub>).`;

/** The efficiency question ignores the figure, so it only joins once the basics are in place. */
function maxPowerBuilt(t: TwoTerminal, withEfficiency: boolean): Built {
  const Pmax = (t.Vt * t.Vt) / (4 * t.Rt);
  const iMax = t.Vt / (2 * t.Rt);
  const k = pick([2, 3, 4, 9] as const);
  const eta = (k / (k + 1)) * 100;
  const thevenin = [...t.rtSteps, ...t.vtSteps];

  return {
    title: t.title.replace('Thévenin', 'Max. vermogen'),
    steps: [RULE],
    variants: [
      variant(
        `Er wordt een belasting R<sub>L</sub> op a-b aangesloten. Welke waarde moet R<sub>L</sub> hebben om er zoveel mogelijk vermogen in te krijgen?`,
        'Ω',
        t.Rt,
        [...t.rtSteps, `Dus R<sub>L</sub> = R<sub>t</sub> = <b>${fmt(t.Rt)} Ω</b>.`],
      ),
      variant(
        `Hoe groot is het maximale vermogen P<sub>max</sub> dat aan een belasting op a-b kan worden afgegeven?`,
        'W',
        Pmax,
        [...thevenin, `P<sub>max</sub> = V<sub>t</sub>²/(4·R<sub>t</sub>) = ${fmt(t.Vt)}²/(4·${fmt(t.Rt)}) = <b>${fmt(Pmax)} W</b>`],
      ),
      variant(
        `Hoe groot is de stroom door R<sub>L</sub> als die zo is gekozen dat het vermogen maximaal is?`,
        'A',
        iMax,
        [
          ...thevenin,
          `Met R<sub>L</sub> = R<sub>t</sub> staat er 2·R<sub>t</sub> in de lus: i = V<sub>t</sub>/(2·R<sub>t</sub>) = ${fmt(t.Vt)}/(2·${fmt(t.Rt)}) = <b>${fmt(iMax)} A</b> — precies de helft van de kortsluitstroom.`,
        ],
      ),
    ].concat(
      withEfficiency
        ? [
      variant(
        `Stel R<sub>L</sub> = ${k}·R<sub>t</sub>. Welk percentage van het vermogen dat de bron V<sub>t</sub> in het Thévenin-model levert, komt in R<sub>L</sub> terecht?`,
        '%',
        eta,
        [
          `R<sub>t</sub> en R<sub>L</sub> voeren dezelfde stroom, dus het vermogen verdeelt zich in verhouding tot de weerstanden.`,
          `η = R<sub>L</sub>/(R<sub>t</sub> + R<sub>L</sub>)·100% = ${k}/(1 + ${k})·100% = <b>${fmt(eta)} %</b>. (Bij R<sub>L</sub> = R<sub>t</sub> is dat maar 50% — maximaal vermogen is niet hetzelfde als maximaal rendement.)`,
        ],
      ),
          ]
        : [],
    ),
    circuit: t.circuit,
  };
}

export function buildMaxPower(level: number): Built {
  return maxPowerBuilt(buildTwoTerminal(level), level >= 1);
}

export function generateMaxPower(streak = 0): Problem {
  return problemFrom('max-power', 'theorem', buildMaxPower(difficultyLevel(streak)));
}
