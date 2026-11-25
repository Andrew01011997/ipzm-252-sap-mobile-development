import type { TodoCategory } from './todo-category';

export const TODO_TITLE_MAX_LENGTH = 100;
export const TODO_DESCRIPTION_MAX_LENGTH = 500;

export interface TodoPhoto {
  readonly url: string;
  readonly path: string;
}

export interface TodoLocation {
  readonly lat: number;
  readonly lng: number;
  readonly accuracy: number | null;
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
  readonly location: TodoLocation | null;
  readonly category: TodoCategory;
}

export interface TodoDraft {
  readonly title: string;
  readonly description: string;
  readonly dueDate: number | null;
  readonly photo: Blob | null;
  readonly location: TodoLocation | null;
  readonly category: TodoCategory;
}
