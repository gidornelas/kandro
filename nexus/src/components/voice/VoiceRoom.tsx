import { useState, useEffect } from 'react'
import { LiveKitRoom, VideoConference, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import { useVoiceStore } from '../../stores/voiceStore'
import { useUIStore } from '../../stores/uiStore'
import { Tooltip } from '../ui/tooltip'

function formatTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function VoiceRoomHeader() {
  const { micEnabled, cameraEnabled, layout, chatOpen, toggleMic, toggleCamera, toggleChat, disconnect, setLayout } = useVoiceStore()
  const { activeProjectId, openProject } = useUIStore()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const circleBtn = 'min-w-[44px] min-h-[44px] rounded-full border border-[var(--b2)] cursor-pointer text-sm flex items-center justify-center'

  return (
    <div className="h-[52px] bg-[rgba(9,10,12,.92)] border-b border-[var(--b1)] backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0">
      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[var(--grn-s)] border border-[rgba(48,209,88,0.25)] rounded-full text-[10px] font-bold text-[var(--grn)] tracking-wide">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--grn)] motion-safe:animate-[livepulse_1.5s_infinite]" />
        AO VIVO
      </div>
      <span className="text-sm font-bold">Sala de Voz</span>
      <span className="text-xs text-[var(--t3)]">LiveKit</span>
      <span className="text-xs font-semibold font-mono text-[var(--t2)]">{formatTime(seconds)}</span>
      <div className="flex-1" />

      {(['voice', 'grid', 'spotlight', 'screen'] as const).map(l => (
        <button key={l} onClick={() => setLayout(l)} className="min-h-[44px] px-2.5 rounded-[var(--r-sm)] border-none text-[11px] cursor-pointer font-body" style={{
          background: layout === l ? 'var(--acc-s)' : 'transparent',
          color: layout === l ? 'var(--acc)' : 'var(--t3)',
        }}>
          {l === 'voice' ? '🎙 Voz' : l === 'grid' ? '⊞ Grid' : l === 'spotlight' ? '⬡ Destaque' : '🖥 Tela'}
        </button>
      ))}

      <Tooltip content={micEnabled ? 'Desativar microfone' : 'Ativar microfone'}>
        <button onClick={toggleMic} className={`${circleBtn} ${micEnabled ? 'bg-[var(--acc-s)] text-[var(--acc)]' : 'bg-[var(--s3)] text-[var(--t3)]'}`} aria-label={micEnabled ? 'Desativar microfone' : 'Ativar microfone'}>
          {micEnabled ? '🎤' : '🔇'}
        </button>
      </Tooltip>
      <Tooltip content={cameraEnabled ? 'Desativar câmera' : 'Ativar câmera'}>
        <button onClick={toggleCamera} className={`${circleBtn} ${cameraEnabled ? 'bg-[var(--acc-s)] text-[var(--acc)]' : 'bg-[var(--s3)] text-[var(--t3)]'}`} aria-label={cameraEnabled ? 'Desativar câmera' : 'Ativar câmera'}>
          {cameraEnabled ? '📷' : '🚫'}
        </button>
      </Tooltip>

      <Tooltip content="Chat">
        <button onClick={toggleChat} className={`${circleBtn} ${chatOpen ? 'bg-[var(--acc-s)] text-[var(--acc)]' : 'bg-[var(--s3)] text-[var(--t3)]'}`} aria-label="Chat">
          💬
        </button>
      </Tooltip>

      <button onClick={() => { disconnect(); if (activeProjectId) openProject(activeProjectId) }} className="min-h-[44px] px-3 rounded-[var(--r-sm)] border border-[rgba(255,69,58,0.35)] bg-[rgba(255,69,58,0.08)] text-[var(--red)] text-xs cursor-pointer">
        ✕ Sair
      </button>
    </div>
  )
}

function RoomChatPanel() {
  const { chatOpen, toggleChat } = useVoiceStore()
  const [messages] = useState<{ id: number; user: string; text: string }[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setInput('')
  }

  return (
    <div className="overflow-hidden bg-[var(--s1)] flex flex-col flex-shrink-0" style={{
      width: chatOpen ? 280 : 0,
      transition: 'width .28s cubic-bezier(.4,0,.2,1)',
      borderLeft: chatOpen ? '1px solid var(--b1)' : 'none',
    }}>
      {chatOpen && (
        <>
          <div className="h-12 border-b border-[var(--b1)] flex items-center px-3 text-sm font-bold flex-shrink-0">
            💬 Chat da sala
            <div className="flex-1" />
            <button onClick={() => toggleChat()} className="w-[44px] h-[44px] rounded-[var(--r-sm)] border-none bg-transparent text-[var(--t3)] cursor-pointer text-base flex items-center justify-center" aria-label="Fechar chat">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.length === 0 && (
              <div className="text-xs text-[var(--t3)] text-center pt-5">Nenhuma mensagem ainda</div>
            )}
          </div>
          <div className="p-2.5 border-t border-[var(--b1)] flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
              placeholder="Mensagem…"
              className="w-full bg-[var(--s3)] border border-[var(--b2)] rounded-[var(--r)] px-2.5 py-2 text-sm text-[var(--t1)] font-body outline-none"
            />
          </div>
        </>
      )}
    </div>
  )
}

function LiveKitControls() {
  const { micEnabled, cameraEnabled, toggleMic, toggleCamera } = useVoiceStore()
  const { localParticipant } = useLocalParticipant()
  // Sync LiveKit participant state to store
  useRemoteParticipants()

  const handleMicToggle = () => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!micEnabled)
    }
    toggleMic()
  }

  const handleCameraToggle = () => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(!cameraEnabled)
    }
    toggleCamera()
  }

  return (
    <div className="h-[62px] bg-[rgba(9,10,12,.92)] border-t border-[var(--b1)] backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0">
      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[var(--grn-s)] border border-[rgba(48,209,88,0.25)] rounded-full text-[10px] font-bold text-[var(--grn)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--grn)]" />
        AO VIVO
      </div>
      <span className="text-sm font-bold">Sala de Voz</span>
      <div className="flex-1" />

      <button onClick={handleMicToggle} className="w-10 h-10 rounded-full border border-[var(--b2)] cursor-pointer text-base flex items-center justify-center" style={{
        background: micEnabled ? 'var(--acc-s)' : 'var(--s3)',
        color: micEnabled ? 'var(--acc)' : 'var(--t3)',
      }} aria-label={micEnabled ? 'Desativar microfone' : 'Ativar microfone'}>{micEnabled ? '🎤' : '🔇'}</button>

      <button onClick={handleCameraToggle} className="w-10 h-10 rounded-full border border-[var(--b2)] cursor-pointer text-base flex items-center justify-center" style={{
        background: cameraEnabled ? 'var(--acc-s)' : 'var(--s3)',
        color: cameraEnabled ? 'var(--acc)' : 'var(--t3)',
      }} aria-label={cameraEnabled ? 'Desativar câmera' : 'Ativar câmera'}>{cameraEnabled ? '📷' : '🚫'}</button>

      <button onClick={() => { useVoiceStore.getState().disconnect() }} className="min-h-[44px] px-3.5 rounded-[var(--r-sm)] border border-[rgba(255,69,58,0.35)] bg-[rgba(255,69,58,0.08)] text-[var(--red)] text-xs cursor-pointer">✕ Sair</button>
    </div>
  )
}

export default function VoiceRoom() {
  const { token, url, connectionState, error } = useVoiceStore()

  if (connectionState === 'connecting') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#090a0c] text-[var(--t3)] text-sm">
        Conectando ao LiveKit...
      </div>
    )
  }

  if (connectionState === 'error' && !token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#090a0c] p-10">
        <div className="text-4xl">🔇</div>
        <div className="text-[var(--t1)] text-base font-semibold">Não foi possível conectar</div>
        <div className="text-[var(--t3)] text-sm text-center max-w-[400px]">
          {error || 'O serviço de voz não está disponível no momento. Verifique as configurações do LiveKit.'}
        </div>
      </div>
    )
  }

  if (!token || !url) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#090a0c] text-[var(--t3)] text-sm">
        Sala de voz não configurada
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090a0c]">
      <VoiceRoomHeader />
      <div className="flex-1 flex overflow-hidden">
        <LiveKitRoom
          serverUrl={url}
          token={token}
          connect={true}
          audio={true}
          video={false}
          className="flex-1 flex flex-col"
          onConnected={() => {
            console.log('[LiveKit] Connected to room')
          }}
          onDisconnected={() => {
            console.log('[LiveKit] Disconnected from room')
          }}
        >
          <VideoConference />
        </LiveKitRoom>
        <RoomChatPanel />
      </div>
      <LiveKitControls />
    </div>
  )
}
