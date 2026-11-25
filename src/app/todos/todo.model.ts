export const TODO_TITLE_MAX_LENGTH = 100;
export const TODO_DESCRIPTION_MAX_LENGTH = 500;

export interface Todo {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly createdAt: number;
}

export type TodoDraft = Pick<Todo, 'title' | 'description'>;
