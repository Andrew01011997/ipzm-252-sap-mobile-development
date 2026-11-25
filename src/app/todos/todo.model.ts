export const TODO_TITLE_MAX_LENGTH = 100;
export const TODO_DESCRIPTION_MAX_LENGTH = 500;

export interface TodoPhoto {
  readonly url: string;
  readonly path: string;
}

export interface Todo {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly createdAt: number;
  readonly dueDate: number | null;
  readonly photo: TodoPhoto | null;
}

export interface TodoDraft {
  readonly title: string;
  readonly description: string;
  readonly dueDate: number | null;
  readonly photo: Blob | null;
}
