import React, { useState, useEffect, useRef } from 'react';
import imageNotBlessed from './assets/not-blessed.jpg';
import imageBlessed from './assets/blessed.jpg';
import blessingSound from './assets/blessing-sound.mp3';

type Language = 'tr' | 'en';
type Theme = 'light' | 'dark';

const translations = {
  tr: {
    title: 'QuickBlessing',
    disclaimer: 'Bu site tamamen eğlence amaçlı tasarlanmıştır.',
    blessMe: 'Kutsanmak İçin Basınız',
    timeUntilNext: 'Tekrar kutsanmaya:'
  },
  en: {
    title: 'QuickBlessing',
    disclaimer: 'This site is designed purely for entertainment purposes.',
    blessMe: 'Click to Be Blessed',
    timeUntilNext: 'Next blessing in:'
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'tr';
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });
  
  const [isBlessed, setIsBlessed] = useState(() => {
    const saved = localStorage.getItem('isBlessed');
    return saved === 'true';
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEndTime = localStorage.getItem('endTime');
    
    if (savedEndTime) {
      const remaining = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    
    return 0;
  });
  
  const [isWaiting, setIsWaiting] = useState(() => {
    const saved = localStorage.getItem('isWaiting');
    const savedEndTime = localStorage.getItem('endTime');
    if (savedEndTime) {
      const remaining = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      return saved === 'true' && remaining > 0;
    }
    return false;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = translations[language];
  const WAIT_TIME = 600;

  // Ayarları kaydet
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('isBlessed', isBlessed.toString());
  }, [isBlessed]);

  useEffect(() => {
    localStorage.setItem('isWaiting', isWaiting.toString());
  }, [isWaiting]);

  useEffect(() => {
    let interval: number | undefined;

    if (isWaiting && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsWaiting(false);
            setIsBlessed(false);
            localStorage.removeItem('endTime');
            localStorage.removeItem('isWaiting');
            localStorage.removeItem('isBlessed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaiting, timeLeft]);

  const handleButtonClick = () => {
    if (!isWaiting) {
      setIsBlessed(true);
      setIsWaiting(true);
      setTimeLeft(WAIT_TIME);
      
      // Bitiş zamanını kaydet
      const endTime = Date.now() + (WAIT_TIME * 1000);
      localStorage.setItem('endTime', endTime.toString());
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.log('Müzik çalınamadı:', err);
        });
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'tr' ? 'en' : 'tr'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const bgColor = theme === 'light' 
    ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' 
    : 'bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-gray-100';
  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const buttonBg = theme === 'light' ? 'bg-amber-100 hover:bg-amber-200' : 'bg-purple-900 hover:bg-purple-800';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col transition-colors duration-300`}>
      <audio ref={audioRef} src={blessingSound} preload="auto" />

      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
          {t.title}
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full ${buttonBg} transition-colors duration-200 text-2xl`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={toggleLanguage}
            className={`p-3 rounded-full ${buttonBg} transition-colors duration-200 flex items-center gap-2`}
            aria-label="Toggle language"
          >
            <span className="text-xl">🌍</span>
            <span className="text-sm font-medium">{language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        {/* Görsel */}
        <div className="relative">
          {/* Parlama efekti */}
          {isBlessed && (
            <>
              <div className="absolute inset-0 animate-pulse">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 blur-2xl opacity-75"></div>
              </div>
              <div className="absolute inset-0 animate-ping">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 blur-xl opacity-50"></div>
              </div>
            </>
          )}
          
          <div className={`${cardBg} rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 relative ${
            isBlessed ? 'scale-105 ring-4 ring-yellow-400 ring-opacity-50' : ''
          }`}>
            <img
              src={isBlessed ? imageBlessed : imageNotBlessed}
              alt={isBlessed ? 'Blessed' : 'Not Blessed'}
              className="w-auto h-[750px] object-cover"
            />
            
            {/* Işık parıltıları */}
            {isBlessed && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-amber-300 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 left-0 w-24 h-24 bg-orange-300 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 right-0 w-24 h-24 bg-yellow-300 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Buton */}
        <button
          onClick={handleButtonClick}
          disabled={isWaiting}
          className={`px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-xl ${
            !isWaiting
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 hover:scale-105 hover:shadow-2xl text-white cursor-pointer transform active:scale-95'
              : 'bg-gray-400 cursor-not-allowed opacity-60 text-gray-200'
          }`}
        >
          {t.blessMe}
        </button>

        {/* Sayaç */}
        {isWaiting && (
          <div className={`${cardBg} rounded-2xl p-6 shadow-xl min-w-[280px] text-center`}>
            <p className="text-sm mb-3 opacity-75 font-medium">{t.timeUntilNext}</p>
            <p className="text-4xl font-bold font-mono bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {formatTime(timeLeft)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm opacity-75">
        <p>{t.disclaimer}</p>
      </footer>
    </div>
  );
};

export default App