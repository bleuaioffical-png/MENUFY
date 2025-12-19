import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';

interface AdminLoginProps {
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useRestaurant();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/5 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-gray-100 p-10 shadow-2xl animate-pop">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-gray-900 text-white font-black rounded-2xl flex items-center justify-center mx-auto mb-4 text-sm">TF</div>
          <h2 className="text-xl font-bold text-gray-900">Manager Access</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Enter credentials to unlock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              className={`w-full bg-gray-50 border rounded-xl py-4 text-center focus:outline-none focus:ring-4 focus:ring-gray-50 transition-all font-bold tracking-widest ${error ? 'border-red-500 ring-red-50' : 'border-gray-100'}`}
              autoFocus
            />
            {error && <p className="text-red-500 text-[9px] font-black uppercase text-center tracking-widest">Access Denied</p>}
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors"
            >
                Back
            </button>
            <button 
                type="submit"
                className="flex-[2] py-4 bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-soft hover:bg-black transition-all"
            >
                Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};