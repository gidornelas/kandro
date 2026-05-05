import { useState, useCallback, useRef } from 'react'
import { getVoiceToken } from '../api/voice'

interface LiveKitState {
  token: string | null
  room: string | null
  url: string | null
  loading: boolean
  error: string | null
  channelId: string | null
}

export function useLiveKitVoice() {
  const [state, setState] = useState<LiveKitState>({
    token: null,
    room: null,
    url: null,
    loading: false,
    error: null,
    channelId: null,
  })
  const abortRef = useRef(false)

  const connect = useCallback(async (channelId: string) => {
    abortRef.current = false
    setState(s => ({ ...s, loading: true, error: null, channelId }))
    try {
      const res = await getVoiceToken(channelId)
      if (abortRef.current) return
      setState({
        token: res.token,
        room: res.room,
        url: res.url,
        loading: false,
        error: null,
        channelId,
      })
    } catch (err) {
      if (abortRef.current) return
      const message = err instanceof Error ? err.message : 'Erro ao conectar ao LiveKit'
      setState(s => ({ ...s, loading: false, error: message }))
    }
  }, [])

  const disconnect = useCallback(() => {
    abortRef.current = true
    setState({
      token: null,
      room: null,
      url: null,
      loading: false,
      error: null,
      channelId: null,
    })
  }, [])

  return { ...state, connect, disconnect }
}
