import React, { useState } from 'react';
import { FlightResult } from '@/hooks/use-fastamor-chat';

interface FlightResultsGridProps {
  flights: FlightResult[];
  currency: string;
  onBook?: (flight: FlightResult) => void;
}

export const FlightResultsGrid: React.FC<FlightResultsGridProps> = ({ 
  flights, 
  currency, 
  onBook 
}) => {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [hoveredFlight, setHoveredFlight] = useState<string | null>(null);

  if (!flights || flights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        ✈️ لا توجد رحلات متاحة حالياً
      </div>
    );
  }

  const getAirlineLogo = (airline: string) => {
    const logos: Record<string, { emoji: string; color: string }> = {
      'Ryanair': { emoji: '✈️', color: 'bg-blue-100 text-blue-700' },
      'Air Arabia': { emoji: '🛫', color: 'bg-green-100 text-green-700' },
      'Royal Air Maroc': { emoji: '🇲🇦', color: 'bg-red-100 text-red-700' },
      'Air France': { emoji: '🇫🇷', color: 'bg-blue-100 text-blue-700' },
      'Transavia': { emoji: '🛩️', color: 'bg-orange-100 text-orange-700' },
      'EasyJet': { emoji: '🟠', color: 'bg-orange-100 text-orange-700' },
      'Iberia': { emoji: '🇪🇸', color: 'bg-red-100 text-red-700' },
      'Vueling': { emoji: '🔴', color: 'bg-red-100 text-red-700' },
      'TUI fly': { emoji: '🟩', color: 'bg-green-100 text-green-700' },
    };
    return logos[airline] || { emoji: '✈️', color: 'bg-gray-100 text-gray-700' };
  };

  const getStopText = (stops: string) => {
    const num = parseInt(stops);
    if (isNaN(num) || num === 0) return { text: 'مباشرة', icon: '🟢', color: 'text-green-600' };
    if (num === 1) return { text: 'توقف واحد', icon: '🔄', color: 'text-orange-600' };
    return { text: `${num} توقفات`, icon: '🔄', color: 'text-red-600' };
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const calculateArrivalTime = (departure: string, duration: string) => {
    try {
      const depTime = new Date(departure);
      const durationMatch = duration.match(/(\d+)h/);
      const hours = durationMatch ? parseInt(durationMatch[1]) : 3;
      depTime.setHours(depTime.getHours() + hours);
      return depTime.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const handleBook = (flight: FlightResult) => {
    if (onBook) {
      onBook(flight);
    } else if (flight.booking_url) {
      window.open(flight.booking_url, '_blank');
    }
  };

  const cheapestPrice = Math.min(...flights.map(f => f.price));

  return (
    <div className="flight-results-container space-y-4 p-2">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          🎫 أفضل عروض الرحلات
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          تم العثور على {flights.length} رحلة
        </p>
      </div>

      {flights.slice(0, 10).map((flight) => {
        const airline = getAirlineLogo(flight.airline);
        const stopInfo = getStopText(flight.stops);
        const isCheapest = flight.price === cheapestPrice;
        const isSelected = selectedFlight === flight.id;
        const isHovered = hoveredFlight === flight.id;

        return (
          <div
            key={flight.id}
            className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 overflow-hidden
              ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 dark:border-gray-700'}
              ${isHovered ? 'transform scale-[1.02]' : ''}
            `}
            onClick={() => setSelectedFlight(flight.id)}
            onMouseEnter={() => setHoveredFlight(flight.id)}
            onMouseLeave={() => setHoveredFlight(null)}
          >
            {isCheapest && (
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                  🏆 أرخص عرض!
                </div>
              </div>
            )}

            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${airline.color} flex items-center justify-center text-2xl shadow-sm`}>
                    {airline.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                      {flight.airline}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{flight.gate || 'الخروج الرئيسي'}</span>
                      <span>•</span>
                      <span>الرحلة #{flight.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {flight.price.toLocaleString()} {currency}
                  </div>
                  <div className="text-xs text-gray-400">للبالغ</div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-3"></div>

              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatTime(flight.departure_time)}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {flight.origin}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(flight.departure_time)}
                  </div>
                </div>

                <div className="flex-1 text-center px-2">
                  <div className="relative">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-2 rounded-full">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ✈️ {flight.duration}
                      </span>
                    </div>
                  </div>
                  <div className={`text-xs mt-2 ${stopInfo.color} flex items-center justify-center gap-1`}>
                    <span>{stopInfo.icon}</span>
                    <span>{stopInfo.text}</span>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {calculateArrivalTime(flight.departure_time, flight.duration)}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {flight.destination}
                  </div>
                  <div className="text-xs text-gray-400">
                    الوصول
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBook(flight);
                }}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>🎟️</span>
                <span>احجز الآن</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FlightResultsGrid;