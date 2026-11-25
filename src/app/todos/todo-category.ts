import { briefcaseOutline, ellipsisHorizontalCircleOutline, homeOutline, schoolOutline } from 'ionicons/icons';

export const TODO_CATEGORIES = ['study', 'work', 'home', 'other'] as const;

export type TodoCategory = (typeof TODO_CATEGORIES)[number];

export const DEFAULT_TODO_CATEGORY: TodoCategory = 'other';

export interface TodoCategoryMeta {
  readonly icon: string;
  readonly iconName: string;
  readonly color: string;
  readonly markerUrl: string;
}

export const TODO_CATEGORY_META: Readonly<Record<TodoCategory, TodoCategoryMeta>> = {
  study: { markerUrl: 'assets/markers/study.png', icon: schoolOutline, iconName: 'school-outline', color: '#3b82f6' },
  work: {
    markerUrl: 'assets/markers/work.png',
    icon: briefcaseOutline,
    iconName: 'briefcase-outline',
    color: '#8b5cf6',
  },
  home: { markerUrl: 'assets/markers/home.png', icon: homeOutline, iconName: 'home-outline', color: '#10b981' },
  other: {
    markerUrl: 'assets/markers/other.png',
    icon: ellipsisHorizontalCircleOutline,
    iconName: 'ellipsis-horizontal-circle-outline',
    color: '#737373',
  },
};

export const TODO_CATEGORY_ICONS = Object.fromEntries(
  Object.values(TODO_CATEGORY_META).map(({ iconName, icon }) => [iconName, icon]),
);

export function isTodoCategory(value: unknown): value is TodoCategory {
  return typeof value === 'string' && (TODO_CATEGORIES as readonly string[]).includes(value);
}
