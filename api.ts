import { IncidentReport, Device, ReportDate } from './types';

const API_URL = '/api';

export const api = {
  // Incidents
  getIncidents: async (date: ReportDate): Promise<IncidentReport[]> => {
    const res = await fetch(`${API_URL}/incidents?month=${date.month}&year=${date.year}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  saveIncident: async (incident: Omit<IncidentReport, 'id'> & { id?: string }) => {
    const method = incident.id ? 'PUT' : 'POST';
    const url = incident.id ? `${API_URL}/incidents/${incident.id}` : `${API_URL}/incidents`;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    if (!res.ok) throw new Error('Failed to save incident');
    return res.json();
  },

  deleteIncident: async (id: string) => {
    const res = await fetch(`${API_URL}/incidents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete incident');
  },

  // Devices
  getDevices: async (): Promise<Device[]> => {
    const res = await fetch(`${API_URL}/devices`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  saveDevice: async (device: Device) => {
    const method = 'POST'; // We use upsert logic or simple POST in this simplified backend
    // Check if updating or creating based on ID existence in list usually, 
    // but here we will send to an upsert-like endpoint or handle ID in backend
    const res = await fetch(`${API_URL}/devices`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device),
    });
    if (!res.ok) throw new Error('Failed to save device');
    return res.json();
  },

  deleteDevice: async (id: string) => {
    const res = await fetch(`${API_URL}/devices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete device');
  },
  
  syncDevices: async (devices: Device[]) => {
      const res = await fetch(`${API_URL}/devices/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ devices }),
      });
      if (!res.ok) throw new Error('Failed to sync default devices');
      return res.json();
  }
};