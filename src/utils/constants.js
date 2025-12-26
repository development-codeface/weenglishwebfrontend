export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
];

export const SUBSCRIPTION_DURATIONS = [
  { value: 'weekly', label: 'Weekly (7 days)' },
  { value: 'monthly', label: 'Monthly (30 days)' },
  { value: 'yearly', label: 'Yearly (365 days)' },
];

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home' },
  { id: 'chapters', label: 'Chapters', path: '/chapters', icon: 'BookOpen' },
  { id: 'lessons', label: 'Lessons', path: '/lessons', icon: 'FileText' },
  { id: 'topics', label: 'Topics', path: '/topics', icon: 'Grid' },
  { id: 'subtopics', label: 'A to Z SubTopics', path: '/subtopics', icon: 'Grid' },
  { id: 'chatcategories', label: 'Chat Categories', path: '/chatcategories', icon: 'MessageSquare' },
  { id: 'quizzes', label: 'Quizzes', path: '/quizzes', icon: 'HelpCircle' },
  { id: 'subscriptions', label: 'Subscriptions', path: '/subscriptions', icon: 'DollarSign' },
  { id: 'discounts', label: 'Discounts', path: '/discounts', icon: 'Tag' },
  { id: 'whylearn', label: 'Why Learn', path: '/whylearn', icon: 'Users' },
];

export const DEFAULT_MULTILINGUAL = {
  en: '',
  ml: '',
  ta: '',
  te: '',
  hi: '',
  kn: '',
};