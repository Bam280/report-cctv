import React, { useState, useEffect } from 'react';
import { IncidentReport, Device } from '../types';
import { STATUS_OPTIONS, ALERT_SOURCES } from '../constants';
import { X, Save } from 'lucide-react';
import { api } from '../api';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incident: Omit<IncidentReport, 'id'>) => void;
  initialData?: IncidentReport | null;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Omit<IncidentReport, 'id'>>({
    incidentTime: '',
    device: '',
    ip: '',
    alertSource: ALERT_SOURCES[0],
    status: 'Open',
    reason: '',
    resolution: '',
    sn: ''
  });

  const [storedDevices, setStoredDevices] = useState<Device[]>([]);

  // Load device database for autocomplete
  useEffect(() => {
    const fetchDevices = async () => {
        if (isOpen) {
            try {
                const devices = await api.getDevices();
                setStoredDevices(devices);
            } catch (e) {
                console.error("Failed to load devices db for modal");
            }
        }
    };
    fetchDevices();
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        incidentTime: initialData.incidentTime,
        device: initialData.device,
        ip: initialData.ip || '',
        alertSource: initialData.alertSource,
        status: initialData.status,
        reason: initialData.reason,
        resolution: initialData.resolution,
        sn: initialData.sn,
      });
    } else {
      // Reset for new entry
      const now = new Date();
      // Format datetime-local string: YYYY-MM-DDThh:mm
      const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      
      setFormData({
        incidentTime: localIso,
        device: '',
        ip: '',
        alertSource: ALERT_SOURCES[0],
        status: 'Open',
        reason: '',
        resolution: '',
        sn: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Omit<IncidentReport, 'id'>, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-fill SN and IP if device name matches a record in database
      if (field === 'device') {
        const foundDevice = storedDevices.find(d => d.name === value);
        if (foundDevice) {
          updated.sn = foundDevice.sn;
          updated.ip = foundDevice.ip || '';
        }
      }
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-green-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Incident' : 'New Incident Report'}</h2>
          <button onClick={onClose} className="hover:bg-green-600 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Time</label>
              <input
                type="datetime-local"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                value={formData.incidentTime}
                onChange={(e) => handleChange('incidentTime', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
              <input
                type="text"
                list="device-list"
                required
                placeholder="Type or select device..."
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                value={formData.device}
                onChange={(e) => handleChange('device', e.target.value)}
                autoComplete="off"
              />
              <datalist id="device-list">
                {storedDevices.map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500 mt-1">Select from database to auto-fill SN & IP</p>
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input
                type="text"
                placeholder="e.g. 172.18.70.1"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none bg-gray-50"
                value={formData.ip}
                onChange={(e) => handleChange('ip', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number (SN)</label>
              <input
                type="text"
                placeholder="Device SN"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none bg-gray-50"
                value={formData.sn}
                onChange={(e) => handleChange('sn', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Source</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                value={formData.alertSource}
                onChange={(e) => handleChange('alertSource', e.target.value)}
              >
                {ALERT_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as any)}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              rows={2}
              placeholder="Root cause of the downtime..."
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
            <textarea
              rows={2}
              placeholder="Action taken to resolve..."
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
              value={formData.resolution}
              onChange={(e) => handleChange('resolution', e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Save size={18} />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};