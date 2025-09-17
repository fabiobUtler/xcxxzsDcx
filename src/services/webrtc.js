// Заготовка под WebRTC
export class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
  }

  async setup(localStream, remoteStreamCallback) {
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.localStream.getTracks().forEach(track => 
      this.peerConnection.addTrack(track, this.localStream)
    );

    this.peerConnection.ontrack = (event) => {
      remoteStreamCallback(event.streams[0]);
    };

    // Здесь будет сигнализация (WebSocket)
    return this.peerConnection.createOffer();
  }

  close() {
    this.peerConnection?.close();
    this.localStream?.getTracks().forEach(t => t.stop());
  }
}