export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  waveformData: number[];
}

export interface AudioServiceConfig {
  sampleRate?: number;
  channelCount?: number;
  mimeType?: string;
}

export interface WaveformData {
  frequencies: number[];
  timeDomain: Uint8Array;
  volume: number;
}

export interface RecordingResult {
  blob: Blob;
  duration: number;
  url: string;
}

export type AudioPermissionStatus = 'granted' | 'denied' | 'prompt';
