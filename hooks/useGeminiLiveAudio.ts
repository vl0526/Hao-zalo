import { useState, useRef, useCallback } from 'react';
// FIX: Removed LiveSession as it is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CallState, SpeakingState, NetworkQuality } from '../types';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audio';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;

const SYSTEM_PROMPT = `Bạn là trợ lý ảo thông minh có thể nói chuyện tự nhiên bằng tiếng Việt. Hãy trò chuyện thân thiện, nhiệt tình và hữu ích như một người bạn thật sự. Trả lời ngắn gọn, tự nhiên và có cảm xúc trong giọng nói. Nếu cần tra cứu thông tin, hãy sử dụng Google Tìm kiếm.`;

export const useGeminiLiveAudio = () => {
    const [callState, setCallState] = useState<CallState>(CallState.IDLE);
    const [speakingState, setSpeakingState] = useState<SpeakingState>(SpeakingState.IDLE);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [networkQuality, setNetworkQuality] = useState<NetworkQuality>(NetworkQuality.UNKNOWN);

    // Use refs to hold values that need to be accessed in callbacks without causing re-creations (and avoiding stale closures)
    const isMutedRef = useRef(isMuted);
    isMutedRef.current = isMuted;

    // FIX: Replaced LiveSession with 'any' since it's not an exported type.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    // FIX: Removed playback queue and isPlaying refs to implement a lower-latency playback strategy.
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const userSpeakingTimeoutRef = useRef<number | null>(null);
    const networkCheckIntervalRef = useRef<number | null>(null);
    
    // FIX: Replaced queue-based playback with immediate scheduling to reduce latency, as recommended by Gemini API guidelines.
    const handleServerMessage = useCallback(async (message: LiveServerMessage) => {
        if (userSpeakingTimeoutRef.current) {
            clearTimeout(userSpeakingTimeoutRef.current);
            userSpeakingTimeoutRef.current = null;
        }
        
        // Handle Audio
        const outputContext = outputAudioContextRef.current;
        if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
            if (outputContext) {
                setSpeakingState(SpeakingState.AI_SPEAKING);
                
                nextStartTimeRef.current = Math.max(
                    nextStartTimeRef.current,
                    outputContext.currentTime,
                );

                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    outputContext,
                    OUTPUT_SAMPLE_RATE,
                    1
                );
                
                const source = outputContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputContext.destination);
                
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0) {
                        setSpeakingState(SpeakingState.IDLE);
                    }
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
        } else if (message.serverContent?.interrupted) {
            // Stop all scheduled and playing audio
            audioSourcesRef.current.forEach(source => {
                source.stop();
            });
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setSpeakingState(SpeakingState.IDLE);
        }
    }, []);

    const checkNetworkQuality = useCallback(async () => {
        const startTime = performance.now();
        try {
            // Use a cache-busting query parameter to avoid cached results
            await fetch(`https://www.google.com/favicon.ico?_=${Date.now()}`, {
                method: 'HEAD',
                mode: 'no-cors', // Use no-cors to avoid CORS issues, we only need timing
            });
            const endTime = performance.now();
            const latency = endTime - startTime;

            if (latency < 300) {
                setNetworkQuality(NetworkQuality.GOOD);
            } else if (latency < 800) {
                setNetworkQuality(NetworkQuality.AVERAGE);
            } else {
                setNetworkQuality(NetworkQuality.POOR);
            }
        } catch (e) {
            // Fetch fails if the user is offline
            setNetworkQuality(NetworkQuality.POOR);
        }
    }, []);

    const startCall = useCallback(async () => {
        setCallState(CallState.CONNECTING);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // FIX: Cast window to `any` to allow access to vendor-prefixed webkitAudioContext.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            // FIX: Cast window to `any` to allow access to vendor-prefixed webkitAudioContext.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
            
            nextStartTimeRef.current = outputAudioContextRef.current.currentTime;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        setCallState(CallState.ACTIVE);

                        // Start network quality check
                        if (networkCheckIntervalRef.current) {
                            clearInterval(networkCheckIntervalRef.current);
                        }
                        checkNetworkQuality(); // Initial check
                        networkCheckIntervalRef.current = window.setInterval(checkNetworkQuality, 3000);
                        
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(BUFFER_SIZE, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            if (isMutedRef.current) return;
                            
                            setSpeakingState(state => state !== SpeakingState.USER_SPEAKING ? SpeakingState.USER_SPEAKING : state);

                            if (userSpeakingTimeoutRef.current) {
                                clearTimeout(userSpeakingTimeoutRef.current);
                            }

                            userSpeakingTimeoutRef.current = window.setTimeout(() => {
                                setSpeakingState(state => state === SpeakingState.USER_SPEAKING ? SpeakingState.IDLE : state);
                            }, 500);

                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: handleServerMessage,
                    onerror: (err: ErrorEvent) => {
                        console.error('Session error:', err);
                        setError('Đã xảy ra lỗi trong cuộc gọi.');
                        setCallState(CallState.ERROR);
                    },
                    onclose: () => {
                        console.log('Session closed.');
                        // Don't set state to ENDED here, as endCall handles it.
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
                    },
                    systemInstruction: SYSTEM_PROMPT,
                    tools: [{ googleSearch: {} }],
                },
            });
            
            await sessionPromiseRef.current;

        } catch (err) {
            console.error('Failed to start call:', err);
            let errorMessage = 'Không thể bắt đầu cuộc gọi. Vui lòng kiểm tra quyền truy cập micro.';
            if (err instanceof DOMException) {
                switch (err.name) {
                    case 'NotFoundError':
                    case 'DevicesNotFoundError':
                        errorMessage = 'Không tìm thấy micro. Vui lòng kết nối micro và thử lại.';
                        break;
                    case 'NotAllowedError':
                    case 'PermissionDeniedError':
                        errorMessage = 'Từ chối truy cập micro. Vui lòng bật trong cài đặt trình duyệt.';
                        break;
                    case 'NotReadableError':
                        errorMessage = 'Micro của bạn đang được sử dụng bởi ứng dụng khác.';
                        break;
                    case 'AbortError':
                        errorMessage = 'Yêu cầu truy cập micro đã bị từ chối.';
                        break;
                    default:
                        errorMessage = `Không thể truy cập micro: ${err.message}`;
                        break;
                }
            }
            setError(errorMessage);
            setCallState(CallState.ERROR);
        }
    }, [handleServerMessage, checkNetworkQuality]);

    const endCall = useCallback(async () => {
        setCallState(CallState.ENDED);
        setSpeakingState(SpeakingState.IDLE);
        setNetworkQuality(NetworkQuality.UNKNOWN); // Reset network quality on call end
        
        if (userSpeakingTimeoutRef.current) {
            clearTimeout(userSpeakingTimeoutRef.current);
            userSpeakingTimeoutRef.current = null;
        }

        if (networkCheckIntervalRef.current) {
            clearInterval(networkCheckIntervalRef.current);
            networkCheckIntervalRef.current = null;
        }
        
        // Stop any currently playing audio
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        
        // Disconnect audio processing
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        
        // Stop microphone
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        // Close audio contexts
        if (inputAudioContextRef.current?.state !== 'closed') {
            await inputAudioContextRef.current?.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
            await outputAudioContextRef.current?.close();
            outputAudioContextRef.current = null;
        }

        // Close Gemini session
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e)
            } finally {
                sessionPromiseRef.current = null;
            }
        }
    }, []);
    
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return { callState, speakingState, isMuted, error, networkQuality, startCall, endCall, toggleMute };
};
