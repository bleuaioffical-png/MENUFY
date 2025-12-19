import React from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onGameClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onGameClick }) => {
  const { settings } = useRestaurant();

  const handleCall = () => {
    if (settings.phone) {
      window.location.href = `tel:${settings.phone.replace(/\s+/g, '')}`;
    } else {
      alert("Restaurant phone number not configured.");
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-5 items-end">
      {/* Call Support Button */}
      <button
        onClick={handleCall}
        aria-label="Call Restaurant"
        className="bg-white hover:bg-gray-50 text-gray-900 w-12 h-12 rounded-full border border-gray-100 shadow-soft transition-all flex items-center justify-center group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
          <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Game Button */}
      <button
        onClick={onGameClick}
        aria-label="Play Mini Game"
        className="bg-white hover:bg-gray-50 text-gray-900 w-12 h-12 rounded-full border border-gray-100 shadow-soft transition-all flex items-center justify-center group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 group-hover:rotate-12 transition-transform">
          <path d="M14 14L20 20M14 14L10 10M14 14L10 18M14 14L18 10M8 4H4V8M4 4L9 9M16 4H20V8M20 4L15 9M8 20H4V16M4 20L9 15M16 20H20V16M20 20L15 15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Cart Button */}
      <button 
        onClick={onCartClick}
        aria-label="View Order"
        className="relative bg-gray-900 text-white w-14 h-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-[10px] font-black text-white bg-red-600 rounded-full border-2 border-white animate-pop shadow-md">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};