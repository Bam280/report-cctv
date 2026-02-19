import React, { useState, useEffect, useRef } from 'react';
import { MonthYearSelector } from './components/MonthYearSelector';
import { ReportTable } from './components/ReportTable';
import { DeviceManager } from './components/DeviceManager';
import { LoginModal } from './components/LoginModal';
import { ReportDate } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'select' | 'report' | 'admin'>('select');
  const [selectedDate, setSelectedDate] = useState<ReportDate>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('cctv_admin_pwd') || 'P@ssw0rd.S1D');

  // Idle Timer Reference
  const lastActivityRef = useRef(Date.now());

  // Activity Tracking
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  // Idle Check Interval (5 Minutes)
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const CHECK_INTERVAL = 1000;
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivityRef.current > TIMEOUT_MS) {
        setIsAdminAuthenticated(false);
        setCurrentView('select');
        setIsLoginOpen(true); // Optional: Open login modal immediately, or just redirect
        alert("Session timed out due to inactivity (5 minutes).");
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAdminAuthenticated]);

  const handleDateSelection = (date: ReportDate) => {
    setSelectedDate(date);
    setCurrentView('report');
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginAttempt = (password: string): boolean => {
    if (password === adminPassword) {
      setIsAdminAuthenticated(true);
      setIsLoginOpen(false);
      // Update activity to prevent immediate logout if they typed slowly but correctly
      lastActivityRef.current = Date.now(); 
      setCurrentView('admin');
      return true;
    }
    return false;
  };

  const handleChangePassword = (newPassword: string) => {
    setAdminPassword(newPassword);
    localStorage.setItem('cctv_admin_pwd', newPassword);
  };

  const handleBack = () => {
    setCurrentView('select');
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      {currentView === 'select' && (
        <MonthYearSelector onSelect={handleDateSelection} onAdmin={handleAdminClick} />
      )}
      {currentView === 'report' && (
        <ReportTable date={selectedDate} onBack={handleBack} />
      )}
      {currentView === 'admin' && (
        <DeviceManager 
          onBack={handleBack} 
          onChangePassword={handleChangePassword}
        />
      )}

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLoginAttempt}
      />
    </div>
  );
};

export default App;