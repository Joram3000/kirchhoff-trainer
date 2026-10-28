import type { Problem } from '../types';
import { pick } from '../utils/random';
import { difficultyLevel } from '../utils/difficulty';
import { m, d, par } from '../utils/tex';
import { variant, problemFrom, type Built } from './built';
import { buildTwoTerminal, type TwoTerminal } from './thevenin';

const RULE = `Maximale vermogensoverdracht: maak eerst het Thévenin-equivalent (${m`V_t`}, ${m`R_t`}). Het vermogen in de belasting is maximaal als${d`R_L = R_t \qquad\text{en dan is}\qquad P_{\max} = \frac{V_t^2}{4\,R_t}`}`;

/** The efficiency question ignores the figure, so it only joins once the basics are in place. */
function maxPowerBuilt(t: TwoTerminal, withEfficiency: boolean): Built {
  const Pmax = (t.Vt * t.Vt) / (4 * t.Rt);
  const iMax = t.Vt / (2 * t.Rt);
  const k = pick([2, 3, 4, 9] as const);
  const eta = (k / (k + 1)) * 100;
  const thevenin = [...t.rtSteps(false), ...t.vtSteps(false)];

  const variants = [
    variant(
      `Er wordt een belasting R<sub>L</sub> op a-b aangesloten. Welke waarde moet R<sub>L</sub> hebben om er zoveel mogelijk vermogen in te krijgen?`,
      'Ω',
      t.Rt,
      [...t.rtSteps(false), `Dus:${d`R_L = R_t = \boxed{${t.Rt}\,\Omega}`}`],
    ),
    variant(
      `Hoe groot is het maximale vermogen P<sub>max</sub> dat aan een belasting op a-b kan worden afgegeven?`,
      'W',
      Pmax,
      [...thevenin, `Vul in:${d`P_{\max} = \frac{V_t^2}{4\,R_t} = \frac{${par(t.Vt)}^2}{4 \cdot ${t.Rt}} = \boxed{${Pmax}\,\mathrm{W}}`}`],
    ),
    variant(
      `Hoe groot is de stroom door R<sub>L</sub> als die zo is gekozen dat het vermogen maximaal is?`,
      'A',
      iMax,
      [
        ...thevenin,
        `Met ${m`R_L = R_t`} staat er ${m`2R_t`} in de lus — de stroom is precies de helft van de kortsluitstroom:${d`i = \frac{V_t}{2\,R_t} = \frac{${t.Vt}}{2 \cdot ${t.Rt}} = \boxed{${iMax}\,\mathrm{A}}`}`,
      ],
    ),
  ];
  if (withEfficiency) {
    variants.push(
      variant(
        `Stel R<sub>L</sub> = ${k}·R<sub>t</sub>. Welk percentage van het vermogen dat de bron V<sub>t</sub> in het Thévenin-model levert, komt in R<sub>L</sub> terecht?`,
        '%',
        eta,
        [
          `${m`R_t`} en ${m`R_L`} voeren dezelfde stroom, dus het vermogen verdeelt zich in verhouding tot de weerstanden:${d`\eta = \frac{R_L}{R_t + R_L} \cdot 100\% = \frac{${k}}{1 + ${k}} \cdot 100\% = \boxed{${eta}\,\%}`}`,
          `Bij ${m`R_L = R_t`} is dat maar 50% — maximaal vermogen is niet hetzelfde als maximaal rendement.`,
        ],
      ),
    );
  }

  return {
    title: t.title.replace('Thévenin', 'Max. vermogen'),
    steps: [RULE],
    variants,
    circuit: t.circuit,
  };
}

export function buildMaxPower(level: number): Built {
  return maxPowerBuilt(buildTwoTerminal(level), level >= 1);
}

export function generateMaxPower(streak = 0): Problem {
  return problemFrom('max-power', 'theorem', buildMaxPower(difficultyLevel(streak)));
}
