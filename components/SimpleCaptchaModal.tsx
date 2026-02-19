import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, RefreshCw } from 'lucide-react';

interface SimpleCaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SimpleCaptchaModal: React.FC<SimpleCaptchaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setAnswer('');
    setError(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === num1 + num2) {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={20} />
            Security Check
          </h2>
          <button onClick={onClose} className="hover:bg-green-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-center text-gray-600">Please solve this simple math problem to continue:</p>
          
          <div className="flex items-center justify-center gap-4 text-2xl font-bold text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span>{num1}</span>
            <span>+</span>
            <span>{num2}</span>
            <span>=</span>
            <input
              type="number"
              autoFocus
              className={`w-20 border-2 rounded-lg p-2 text-center outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'
              }`}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError(false);
              }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium animate-pulse">
              Incorrect answer. Please try again.
            </p>
          )}

          <div className="flex gap-3">
             <button
              type="button"
              onClick={generateCaptcha}
              className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Get new challenge"
            >
              <RefreshCw size={20} />
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors shadow-md"
            >
              Verify & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};