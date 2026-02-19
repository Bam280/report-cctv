import React, { useState } from 'react';
import { MONTHS, YEARS } from '../constants';
import { ReportDate } from '../types';
import { Calendar, Search, Database } from 'lucide-react';
import { SimpleCaptchaModal } from './SimpleCaptchaModal';

interface MonthYearSelectorProps {
  onSelect: (date: ReportDate) => void;
  onAdmin?: () => void;
}

export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({ onSelect, onAdmin }) => {
  const current = new Date();
  const [selectedMonth, setSelectedMonth] = useState(current.getMonth());
  const [selectedYear, setSelectedYear] = useState(current.getFullYear());
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);

  const handleStart = () => {
    setIsCaptchaOpen(true);
  };

  const handleCaptchaSuccess = () => {
    onSelect({ month: selectedMonth, year: selectedYear });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 relative">
        {onAdmin && (
          <button 
            onClick={onAdmin}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Manage Device Database"
          >
            <Database size={20} />
          </button>
        )}
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <Calendar size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">CCTV Downtime Report</h1>
          <p className="text-gray-500 mt-2">Select a period to manage incidents</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Month</label>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m, index) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(index)}
                  className={`px-2 py-2 text-xs sm:text-sm rounded-lg border transition-all ${
                    selectedMonth === index
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Search size={20} />
              Open Report
            </button>
            
            {onAdmin && (
               <button
                 onClick={onAdmin}
                 className="w-full bg-white border border-gray-200 text-gray-600 font-medium py-2 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
               >
                 <Database size={16} />
                 Manage Device Database
               </button>
            )}
          </div>
        </div>
      </div>
      
      <SimpleCaptchaModal 
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
        onSuccess={handleCaptchaSuccess}
      />
    </div>
  );
};