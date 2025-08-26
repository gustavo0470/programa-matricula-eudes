// Utility for weekday translations
export const weekdayTranslations = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
} as const;

// Short versions for compact display
export const weekdayShortTranslations = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom'
} as const;

// Function to translate a single weekday
export function translateWeekday(day: string): string {
  return weekdayTranslations[day as keyof typeof weekdayTranslations] || day;
}

// Function to translate an array of weekdays
export function translateWeekdays(days: string[]): string[] {
  return days.map(day => translateWeekday(day));
}

// Function to translate weekdays and join them
export function translateAndJoinWeekdays(days: string[], separator: string = ', '): string {
  return translateWeekdays(days).join(separator);
}

// Function to translate weekdays to short format
export function translateWeekdayShort(day: string): string {
  return weekdayShortTranslations[day as keyof typeof weekdayShortTranslations] || day;
}

// Function to translate weekdays to short format and join them
export function translateAndJoinWeekdaysShort(days: string[], separator: string = ', '): string {
  return days.map(day => translateWeekdayShort(day)).join(separator);
}
