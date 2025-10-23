import React from 'react';
import { useGeminiLiveAudio } from './hooks/useGeminiLiveAudio';
import { CallState, SpeakingState, NetworkQuality } from './types';
import { PhoneIcon, MicOnIcon, MicOffIcon } from './components/icons';
import Timer from './components/Timer';
import NetworkIndicator from './components/NetworkIndicator';

const ActionButton: React.FC<{
  label: string;
  onClick: () => void;
  isToggled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, onClick, isToggled, children, className }) => (
    <div className="flex flex-col items-center space-y-2">
        <button
            onClick={onClick}
            aria-label={label}
            className={`flex items-center justify-center w-[72px] h-[72px] rounded-full transition-colors duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isToggled ? 'bg-white/90' : 'bg-white/20 hover:bg-white/30'
            } ${className}`}
        >
            {children}
        </button>
        <p className="text-white text-sm font-medium">{label}</p>
    </div>
);

const App: React.FC = () => {
    const { callState, speakingState, isMuted, error, startCall, endCall, toggleMute, networkQuality } = useGeminiLiveAudio();
    
    const USER_AVATAR_URL = 'https://i.postimg.cc/zfRCnFhL/image-removebg-preview.png';
    const GEMINI_AVATAR_URL = 'https://i.imgur.com/2QU0s1j.png';
    const USER_NAME = 'Hào Dz';
    const GEMINI_NAME = 'Gemini';

    const avatarClasses = (isGemini: boolean) => `w-32 h-32 rounded-full object-cover border-4 border-white/30 mb-4 shadow-lg transition-all duration-300 ${
        (isGemini && speakingState === SpeakingState.AI_SPEAKING) ? 'animate-glow-ai' :
        (!isGemini && speakingState === SpeakingState.USER_SPEAKING) ? 'animate-glow-user' : ''
    }`;

    return (
        <div className="w-full h-full text-white flex flex-col font-sans overflow-hidden">
            {(callState === CallState.IDLE || callState === CallState.ENDED || callState === CallState.ERROR) ? (
                // Initial Screen
                <main className="flex-grow flex flex-col items-center justify-between p-6 text-center">
                    <div /> {/* Spacer */}
                    <div className="flex flex-col items-center">
                         <img
                            src={USER_AVATAR_URL}
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white/30 mb-4 shadow-lg"
                        />
                        <h1 className="text-4xl font-bold mb-2">{USER_NAME}</h1>
                        <p className={`text-lg mb-12 px-4 min-h-[28px] ${error ? 'text-red-400 font-semibold' : 'text-gray-300'}`}>
                            {error ? error : callState === CallState.ENDED ? 'Cuộc gọi đã kết thúc' : 'Nhấn để gọi Gemini'}
                        </p>
                    </div>
                    <div className="pb-20">
                         <button
                            onClick={startCall}
                            aria-label={'Bắt đầu cuộc gọi'}
                            className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-green-500 hover:bg-green-600 focus:ring-green-400"
                        >
                            <PhoneIcon className="w-8 h-8 text-white" />
                        </button>
                    </div>
                </main>
            ) : (
                // In-Call Screen
                <main className="flex-grow flex flex-col items-center justify-between p-6 text-center">
                    <div className="w-full pt-6 md:pt-12 flex flex-col items-center">
                        <img
                            src={GEMINI_AVATAR_URL}
                            alt="Gemini Avatar"
                            className={avatarClasses(true)}
                        />
                        <h1 className="text-3xl font-bold">{GEMINI_NAME}</h1>
                        <div className="flex items-center justify-center space-x-2 text-yellow-400 text-lg mt-2 h-7 font-mono">
                           {callState === CallState.CONNECTING ? (
                                <span className="animate-pulse-fast">Đang kết nối...</span> 
                            ) : (
                                <>
                                    <NetworkIndicator quality={networkQuality} />
                                    <Timer callState={callState} />
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="w-full px-6 pb-6">
                        <div className="flex items-center justify-center space-x-12 w-full max-w-sm mx-auto">
                            <ActionButton 
                                label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'} 
                                onClick={toggleMute} 
                                isToggled={isMuted}
                            >
                                {isMuted 
                                    ? <MicOffIcon className="w-8 h-8 text-black" /> 
                                    : <MicOnIcon className="w-8 h-8 text-black" />}
                            </ActionButton>
                            
                            <ActionButton 
                                label="Kết thúc"
                                onClick={endCall}
                                className="!bg-red-500 hover:!bg-red-600"
                            >
                                <PhoneIcon className="w-8 h-8 text-white transition-transform duration-300 rotate-[135deg]" />
                            </ActionButton>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
};

export default App;
