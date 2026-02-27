import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status badge helper
export function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    in_work: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-200 text-gray-500',
  }
  const labels: Record<string, string> = {
    not_started: 'Не начат',
    in_progress: 'В работе',
    completed: 'Завершён',
    in_work: 'В работе',
    archived: 'В архиве',
  }
  return { className: styles[status] || styles.not_started, label: labels[status] || status }
}

// Expertise type badge helper
export function getExpertiseBadge(expertise: string) {
  const styles: Record<string, string> = {
    none: 'bg-gray-100 text-gray-600',
    state: 'bg-red-100 text-red-700',
    non_state: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    none: 'Без экспертизы',
    state: 'Гос. экспертиза',
    non_state: 'Негос. экспертиза',
  }
  return { className: styles[expertise] || styles.none, label: labels[expertise] || expertise }
}

// Remark status badge helper
export function getRemarkStatusBadge(status: string) {
  const styles: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    responded: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-green-100 text-green-700',
  }
  const labels: Record<string, string> = {
    open: 'Открыто',
    responded: 'Ответ дан',
    closed: 'Закрыто',
  }
  return { className: styles[status], label: labels[status] }
}
