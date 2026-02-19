export interface IncidentReport {
  id: string;
  incidentTime: string; // stored as ISO string or HH:mm date string
  device: string;
  ip: string; // IP Address
  alertSource: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  reason: string;
  resolution: string;
  sn: string; // Serial Number
}

export interface ReportDate {
  month: number; // 0-11
  year: number;
}

export interface Device {
  id: string;
  name: string;
  sn: string;
  model?: string;
  ip?: string;
}