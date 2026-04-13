/**
 * Kanban State Machine - Pure business logic, no framework dependencies.
 * Flow is strictly forward: Backlog → To-Do → In Progress → Done
 */

const COLUMN_ORDER: readonly string[] = ['Backlog', 'To-Do', 'In Progress', 'Done'] as const;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'Backlog': ['To-Do'],
  'To-Do': ['In Progress'],
  'In Progress': ['Done'],
  'Done': [], // Terminal state
};

export function canMoveCard(fromColumn: string, toColumn: string): boolean {
  if (fromColumn === toColumn) return false;
  return ALLOWED_TRANSITIONS[fromColumn]?.includes(toColumn) ?? false;
}

export function getNextColumn(currentColumn: string): string | null {
  const currentIndex = COLUMN_ORDER.indexOf(currentColumn);
  if (currentIndex === -1 || currentIndex === COLUMN_ORDER.length - 1) return null;
  return COLUMN_ORDER[currentIndex + 1] as string;
}

export function getColumnOrder(): readonly string[] {
  return COLUMN_ORDER;
}

export function isValidColumn(columnName: string): boolean {
  return COLUMN_ORDER.includes(columnName);
}
