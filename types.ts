
export enum CallState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ERROR = 'ERROR',
}

export enum SpeakingState {
    USER_SPEAKING = 'USER_SPEAKING',
    AI_SPEAKING = 'AI_SPEAKING',
    IDLE = 'IDLE',
}

export enum NetworkQuality {
  UNKNOWN = 'UNKNOWN',
  POOR = 'POOR',
  AVERAGE = 'AVERAGE',
  GOOD = 'GOOD',
}
