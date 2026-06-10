export const CATEGORY_COLORS = [
  { name: 'Lavender', bg: '#EAE4F7', text: '#5C3DAA' },
  { name: 'Mint',     bg: '#DFF5EE', text: '#1E7A55' },
  { name: 'Peach',    bg: '#FDE8DF', text: '#B04D25' },
  { name: 'Rose',     bg: '#FCDEDE', text: '#A02828' },
  { name: 'Sky',      bg: '#DCF0FB', text: '#1A6A9E' },
  { name: 'Lemon',    bg: '#FEF7DC', text: '#8A6500' },
  { name: 'Sage',     bg: '#E0F0E4', text: '#2A6E3F' },
  { name: 'Blush',    bg: '#FCE8F2', text: '#A0326A' },
  { name: 'Slate',    bg: '#E4E8F2', text: '#3A4870' },
  { name: 'Coral',    bg: '#FFE8E0', text: '#B03A20' },
  { name: 'Lilac',    bg: '#F0E4FF', text: '#6A2EAA' },
  { name: 'Teal',     bg: '#DDF5F5', text: '#1A7070' },
] as const

export const ICON_OPTIONS = [
  'UtensilsCrossed', 'Car', 'Zap', 'ShoppingBag', 'Heart', 'Film',
  'BookOpen', 'MoreHorizontal', 'Home', 'Briefcase', 'Plane', 'Gift',
  'Music', 'Coffee', 'Dumbbell', 'Gamepad2',
] as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  TASKS_BOARD: '/tasks/board',
  FINANCE: '/finance',
  FINANCE_SUMMARY: '/finance/summary',
  BUDGET: '/budget',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SETTINGS: '/admin/settings',
} as const
