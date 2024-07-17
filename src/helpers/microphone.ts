export class Microphone {
  initialized: boolean;
  audioContext!: AudioContext;
  microphone!: MediaStreamAudioSourceNode;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  destination!: AudioDestinationNode;
  gainNode!: GainNode;
  volume!: number;

  constructor() {
    this.initialized = false;
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .then((stream) => {
        this.audioContext = new AudioContext();
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.freqRange * 2;
        this.analyser.smoothingTimeConstant = 0.8;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        // gain
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 2;
        this.microphone.connect(this.gainNode).connect(this.analyser);
        // this.microphone.connect(this.gainNode);
        //  // destination
        // this.destination = this.audioContext.destination;
        // this.destination.channelCount = 1;
        // this.microphone.connect(this.destination);
        this.initialized = true;
      })
      .catch((error) => {});
  }
  freqRange = 128;
  sampleRate = 44100;
  setVolume(volume: number) {
    this.volume = volume;
    this.gainNode.gain.value = volume;
    console.log(volume);
  }
  getVolume() {
    return this.volume;
  }
  getDevices = async () => {
    return await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => {
        return devices.filter((device) => device.kind === "audioinput");
      });
  };

  setDevice(deviceId: string) {
    if (!this.initialized) return;
    navigator.mediaDevices
      .getUserMedia({ audio: { deviceId: deviceId } })
      .then((stream) => {
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.microphone.connect(this.analyser);
        // this.microphone.connect(this.gainNode);
        console.log(this.microphone.mediaStream.id);
      });
  }
  getCurrentDevice() {
    return this.microphone?.mediaStream.id || undefined;
  }
  getFrequency() {
    if (!this.initialized) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    let normSamples = Array.from(this.dataArray).map(
      (x) => x / this.freqRange - 1
    );
    return normSamples;
  }
}
