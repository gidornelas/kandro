import React from 'react'
import { useUIStore } from './store'
import { readUiStateFromUrl, writeUiStateToUrl } from './url-state'

export function UrlStateSync() {
  React.useEffect(() => {
    const initialState = readUiStateFromUrl()
    useUIStore.setState((state) => ({
      ...state,
      ...Object.fromEntries(Object.entries(initialState).filter(([, value]) => value !== undefined)),
    }))

    const unsubscribe = useUIStore.subscribe((state) => {
      writeUiStateToUrl({
        mainMode: state.mainMode,
        activeProjectId: state.activeProjectId,
        activeChannelId: state.activeChannelId,
        activeDmId: state.activeDmId,
        projectView: state.projectView,
      })
    })

    writeUiStateToUrl({
      mainMode: useUIStore.getState().mainMode,
      activeProjectId: useUIStore.getState().activeProjectId,
      activeChannelId: useUIStore.getState().activeChannelId,
      activeDmId: useUIStore.getState().activeDmId,
      projectView: useUIStore.getState().projectView,
    })

    return unsubscribe
  }, [])

  return null
}
