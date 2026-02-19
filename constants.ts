export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

export const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const ALERT_SOURCES = ['System Monitor', 'Manual Check', 'User Report', 'Email Alert', 'SMS Gateway'];
