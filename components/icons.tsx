import React from 'react';

export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.279-.087.431l4.248 7.358c.077.152.256.182.431.087l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 7.75V4.5z" clipRule="evenodd" />
  </svg>
);

export const MicOnIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.25a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" />
    <path fillRule="evenodd" d="M8.25 12a3.75 3.75 0 117.5 0v3.75a3.75 3.75 0 11-7.5 0V12zm3.75 2.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
    <path d="M4.5 10.5a.75.75 0 000 1.5h.75a7.5 7.5 0 007.5-7.5V3.75a.75.75 0 00-1.5 0v1.5A6 6 0 006 12h-1.5a.75.75 0 000-1.5H6A4.5 4.5 0 0110.5 6v-.75a.75.75 0 00-1.5 0v.75a3 3 0 003 3V12a3 3 0 00-3-3V8.25a.75.75 0 00-1.5 0V9a4.5 4.5 0 01-4.5 4.5h-.75z" />
    <path d="M15.75 12a.75.75 0 01.75.75v.008a6 6 0 01-6 6h-.008a.75.75 0 01-.742-.75v-.008a4.5 4.5 0 014.5-4.5h.008a.75.75 0 01.75.75z" />
  </svg>
);

export const MicOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.47 4.53a.75.75 0 011.06 0l12 12a.75.75 0 01-1.06 1.06l-12-12a.75.75 0 010-1.06z" clipRule="evenodd" />
    <path d="M8.25 12a3.75 3.75 0 013.75-3.75v-1.5a5.25 5.25 0 10-5.25 5.25H8.25z" />
    <path d="M12.75 15.75a3.75 3.75 0 013.75-3.75H18a5.25 5.25 0 01-5.25 5.25v-1.5z" />
  </svg>
);

export const SpeakerOnIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.75l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 12.828a.75.75 0 000-1.656 5.25 5.25 0 00-4.33-4.33.75.75 0 00-1.025.606v.518a.75.75 0 00.606.744 3.75 3.75 0 013.14 3.14.75.75 0 00.744.606h.518a.75.75 0 00.256-.025z" />
    <path d="M21.159 15.176a.75.75 0 000-1.352 9.002 9.002 0 00-7.49-7.49.75.75 0 00-.961.862v.498a.75.75 0 00.744.692 7.502 7.502 0 016.18 6.18.75.75 0 00.692.744h.498a.75.75 0 00.02-.02z" />
  </svg>
);

export const SpeakerOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.75l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM17.72 17.72a.75.75 0 101.06-1.06L16.06 14l2.72-2.72a.75.75 0 00-1.06-1.06L15 12.94l-2.72-2.72a.75.75 0 00-1.06 1.06L13.94 14l-2.72 2.72a.75.75 0 101.06 1.06L15 15.06l2.72 2.72z" />
  </svg>
);

export const LoadingSpinner: React.FC<{className?: string}> = ({className}) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);