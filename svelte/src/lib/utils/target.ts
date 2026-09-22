/** A single resistor name, several of them, or none — which resistor(s) the
 * current question variant is asking about, so the diagram can highlight it. */
export type ResistorTarget = string | string[] | null;

export function isTarget(name: string, target: ResistorTarget): boolean {
  return target === name || (Array.isArray(target) && target.includes(name));
}
