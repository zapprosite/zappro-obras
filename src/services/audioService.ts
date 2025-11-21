import type { AudioServiceConfig, WaveformData, RecordingResult } from '@/types/audio';

class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private animationFrameId: number | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  async startRecording(config: AudioServiceConfig = {}): Promise<void> {
    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: config.channelCount || 1,
          sampleRate: config.sampleRate || 48000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Set up audio context for waveform analysis
      this.audioContext = new AudioContext({ sampleRate: config.sampleRate || 48000 });
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      source.connect(this.analyser);

      // Set up MediaRecorder
      const mimeType = this.getSupportedMimeType(config.mimeType);
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  async stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const duration = (Date.now() - this.startTime) / 1000;
        
        // Create blob from chunks
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        // Cleanup
        this.cleanup();

        resolve({ blob, duration, url });
      };

      this.mediaRecorder.stop();
      console.log('Recording stopped');
    });
  }

  getWaveformData(): WaveformData | null {
    if (!this.analyser) {
      return null;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);

    this.analyser.getByteTimeDomainData(dataArray);
    this.analyser.getByteFrequencyData(frequencyData);

    // Calculate average volume (0-1)
    const sum = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0);
    const volume = sum / (bufferLength * 128);

    // Get frequency spectrum for visualization
    const frequencies = Array.from(frequencyData).map(value => value / 255);

    return {
      frequencies,
      timeDomain: dataArray,
      volume,
    };
  }

  startWaveformMonitoring(callback: (data: WaveformData) => void): void {
    const updateWaveform = () => {
      const data = this.getWaveformData();
      if (data) {
        callback(data);
      }
      this.animationFrameId = requestAnimationFrame(updateWaveform);
    };
    updateWaveform();
  }

  stopWaveformMonitoring(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private getSupportedMimeType(preferred?: string): string {
    const types = [
      preferred,
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].filter(Boolean) as string[];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
  }

  async convertToWav(blob: Blob): Promise<Blob> {
    // For WAV conversion, we'll decode the audio and re-encode
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create WAV file
    const wav = this.audioBufferToWav(audioBuffer);
    await audioContext.close();

    return new Blob([wav], { type: 'audio/wav' });
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF identifier
    setUint32(0x46464952);
    // File length
    setUint32(36 + length);
    // RIFF type
    setUint32(0x45564157);
    // Format chunk identifier
    setUint32(0x20746d66);
    // Format chunk length
    setUint32(16);
    // Sample format (raw)
    setUint16(1);
    // Channel count
    setUint16(buffer.numberOfChannels);
    // Sample rate
    setUint32(buffer.sampleRate);
    // Byte rate
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
    // Block align
    setUint16(buffer.numberOfChannels * 2);
    // Bits per sample
    setUint16(16);
    // Data chunk identifier
    setUint32(0x61746164);
    // Data chunk length
    setUint32(length);

    // Get channel data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    // Interleave channels and write to buffer
    offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }
}

export const audioService = new AudioService();
