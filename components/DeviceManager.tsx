import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { INITIAL_DEVICES } from '../initialDevices';
import { ArrowLeft, Plus, Trash2, Edit2, Save, Server, Database, UploadCloud, Key, X, RefreshCw } from 'lucide-react';
import { api } from '../api';

interface DeviceManagerProps {
  onBack: () => void;
  onChangePassword: (newPassword: string) => void;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [password, setPassword] = useState('');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Key size={20} />
            Change Admin Password
          </h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(password); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={4}
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 rounded-lg transition-colors">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export const DeviceManager: React.FC<DeviceManagerProps> = ({ onBack, onChangePassword }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sn: '', model: '', ip: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load devices from API
  const loadDevices = async () => {
    setLoading(true);
    try {
        const data = await api.getDevices();
        setDevices(data);
    } catch (e) {
        console.error("Failed to load devices", e);
        alert("Failed to connect to database");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const deviceData = {
      name: formData.name,
      sn: formData.sn,
      model: formData.model,
      ip: formData.ip,
      id: currentId || crypto.randomUUID()
    };
    
    setLoading(true);
    try {
        await api.saveDevice(deviceData);
        await loadDevices();
        handleCancel();
    } catch (e) {
        alert("Failed to save device");
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (device: Device) => {
    setFormData({ 
      name: device.name, 
      sn: device.sn, 
      model: device.model || '', 
      ip: device.ip || '' 
    });
    setCurrentId(device.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this device from database?')) {
      setLoading(true);
      try {
        await api.deleteDevice(id);
        setDevices(prev => prev.filter(d => d.id !== id));
        if (currentId === id) {
            handleCancel();
        }
      } catch (e) {
          alert("Failed to delete device");
      } finally {
          setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', sn: '', model: '', ip: '' });
  };

  const handleImportDefaults = async () => {
    if (devices.length > 0) {
      if (!confirm(`You currently have ${devices.length} devices. This will MERGE the ${INITIAL_DEVICES.length} default devices into your database. This may take a moment. Continue?`)) {
        return;
      }
    }
    
    setLoading(true);
    try {
        await api.syncDevices(INITIAL_DEVICES);
        await loadDevices();
        alert(`Successfully imported default devices.`);
    } catch (e) {
        alert("Failed to import devices");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Server size={20} className="text-blue-600"/>
              Device Database Manager
              {loading && <RefreshCw className="animate-spin text-blue-500" size={16} />}
            </h1>
            <p className="text-sm text-gray-500">Manage device names and serial numbers</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm border border-gray-200"
          >
            <Key size={16} />
            Change Password
          </button>
          <button 
            onClick={handleImportDefaults}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <UploadCloud size={16} />
            Import Default Data ({INITIAL_DEVICES.length})
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {isEditing ? 'Edit Device' : 'Add New Device'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Camera-Lobby-01"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number (SN)</label>
                <input
                  type="text"
                  placeholder="e.g. SN12345678"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  value={formData.sn}
                  onChange={e => setFormData(prev => ({ ...prev, sn: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model (Optional)</label>
                  <input
                    type="text"
                    placeholder="DS-2DE..."
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm"
                    value={formData.model}
                    onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP (Optional)</label>
                  <input
                    type="text"
                    placeholder="172.18..."
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm"
                    value={formData.ip}
                    onChange={e => setFormData(prev => ({ ...prev, ip: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isEditing ? <Save size={18} /> : <Plus size={18} />}
                  {isEditing ? 'Update' : 'Add Device'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <span className="font-semibold text-gray-700">{devices.length} Devices stored</span>
            </div>
            <div className="overflow-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold bg-gray-50">Device Name</th>
                    <th className="px-4 py-3 font-semibold bg-gray-50">Details</th>
                    <th className="px-4 py-3 font-semibold text-right bg-gray-50">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {devices.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                        <Database className="mx-auto mb-2 opacity-50" size={32} />
                        {loading ? 'Loading devices...' : 'No devices found in database.'}
                      </td>
                    </tr>
                  ) : (
                    devices.map(device => (
                      <tr key={device.id} className="hover:bg-blue-50 transition-colors group">
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-gray-800">{device.name}</div>
                          <div className="text-xs text-gray-400">{device.id}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-sm">
                            <span className="text-gray-500 text-xs uppercase tracking-wider">SN:</span> 
                            <span className="font-mono ml-1 text-gray-700">{device.sn || '-'}</span>
                          </div>
                          {(device.model || device.ip) && (
                            <div className="text-xs text-gray-500 mt-1 flex gap-3">
                              {device.model && <span>Model: {device.model}</span>}
                              {device.ip && <span>IP: {device.ip}</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right align-top">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(device)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(device.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={(newPwd) => {
          onChangePassword(newPwd);
          setIsPasswordModalOpen(false);
          alert('Admin password updated locally (Warning: This does not update server auth yet).');
        }}
      />
    </div>
  );
};