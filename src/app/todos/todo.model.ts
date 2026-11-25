export const TODO_TITLE_MAX_LENGTH = 100;
export const TODO_DESCRIPTION_MAX_LENGTH = 500;

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly createdAt: number;
}

export type TodoDraft = Pick<Todo, 'title' | 'description'>;

export function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<keyof Todo, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number'
  );
}
