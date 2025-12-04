// WebSocket client for real-time audio streaming and transcription

export class AudioWebSocketClient {
  private ws: WebSocket | null = null
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private isRecording = false
  private meetingId: string
  private onTranscription: (text: string, startTime: string, endTime: string) => void
  private onError: (error: string) => void

  constructor(
    meetingId: string,
    onTranscription: (text: string, startTime: string, endTime: string) => void,
    onError: (error: string) => void
  ) {
    this.meetingId = meetingId
    this.onTranscription = onTranscription
    this.onError = onError
  }

  async connect() {
    try {
      // In development, use ws://, in production use wss://
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/transcript/stream?meeting_id=${this.meetingId}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.ws?.send(JSON.stringify({
          type: 'start_meeting'
        }))
      }

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'transcription') {
          this.onTranscription(message.text, message.startTime, message.endTime)
        } else if (message.type === 'error') {
          this.onError(message.message)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.onError('Connection failed')
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.onError('Failed to establish connection')
    }
  }

  async startRecording() {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // Create audio context for processing
      this.audioContext = new AudioContext({ sampleRate: 16000 })

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      const audioChunks: Blob[] = []
      let startTime = 0

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })

          // Convert to base64 for transmission
          const arrayBuffer = await audioBlob.arrayBuffer()
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

          // Send to WebSocket
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
              type: 'audio_chunk',
              audio: base64Audio,
              startTime: this.formatTime(startTime),
              endTime: this.formatTime(Date.now() - startTime)
            }))
          }

          audioChunks.length = 0 // Clear chunks
        }
      }

      // Start recording in chunks of 3 seconds
      this.mediaRecorder.start(3000)
      this.isRecording = true
      startTime = Date.now()

    } catch (error) {
      console.error('Failed to start recording:', error)
      this.onError('Failed to access microphone')
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }

    if (this.audioContext) {
      this.audioContext.close()
    }
  }

  endMeeting() {
    this.stopRecording()

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'end_meeting'
      }))
    }

    this.disconnect()
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}
