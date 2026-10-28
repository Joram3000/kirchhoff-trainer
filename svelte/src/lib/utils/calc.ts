/**
 * A small calculator for the scratchpad: + − * / ^, parentheses, unary minus,
 * a Dutch decimal comma, × and · as multiplication, and `//` for two
 * resistors in parallel (a·b / (a + b)). Returns NaN for anything it can't parse.
 */
export function evaluate(input: string): number {
  const src = input.replace(/\s+/g, '').replace(/,/g, '.').replace(/[×·]/g, '*').replace(/[−–]/g, '-');
  let pos = 0;

  const peek = () => src[pos];
  const eat = (s: string) => {
    if (src.startsWith(s, pos)) {
      pos += s.length;
      return true;
    }
    return false;
  };

  // expr := term (('+' | '-') term)*
  function expr(): number {
    let v = term();
    for (;;) {
      if (eat('+')) v += term();
      else if (eat('-')) v -= term();
      else return v;
    }
  }

  // term := power (('*' | '/' | '//') power)*
  function term(): number {
    let v = power();
    for (;;) {
      if (eat('//')) {
        const w = power();
        v = (v * w) / (v + w);
      } else if (eat('*')) v *= power();
      else if (eat('/')) v /= power();
      else return v;
    }
  }

  // power := unary ('^' power)?   (right-associative)
  function power(): number {
    const base = unary();
    return eat('^') ? base ** power() : base;
  }

  function unary(): number {
    if (eat('-')) return -unary();
    if (eat('+')) return unary();
    return atom();
  }

  function atom(): number {
    if (eat('(')) {
      const v = expr();
      return eat(')') ? v : NaN;
    }
    const m = /^\d*\.?\d+(e[+-]?\d+)?/i.exec(src.slice(pos));
    if (!m) return NaN;
    pos += m[0].length;
    return Number(m[0]);
  }

  if (src === '') return NaN;
  const value = expr();
  return pos === src.length ? value : NaN;
}

/** Formats a result for the scratchpad: up to 6 significant digits, decimal comma. */
export function formatResult(n: number): string {
  return String(Number(n.toPrecision(6))).replace('.', ',');
}
