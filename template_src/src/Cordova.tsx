import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ICordovaContext {
    isDeviceReady: boolean
    platformId: string
    listen: (evtType: CordovaEventType, handler: EventListener) => void
    unlisten: (evtType: CordovaEventType, handler: EventListener) => void
}

const CordovaContext = createContext<ICordovaContext | undefined>(undefined)

type CordovaEventType = 'deviceready' | 'resume' | 'pause' | 'backbutton'

const CordovaProvider: React.FC = React.memo(({ children }) => {

    const [isDeviceReady, setDeviceReady] = useState(false)
    const [platformId, setPlatformId] = useState('unknown')

    const onDeviceReady = useCallback(() => {
        setPlatformId(window.cordova.platformId)
        setDeviceReady(true)
    }, [])

    const listen = (evtType: CordovaEventType, handler: EventListener) => {
        document.addEventListener(evtType, handler)
    }

    const unlisten = (evtType: CordovaEventType, handler: EventListener) => {
        document.removeEventListener(evtType, handler)
    }

    useEffect(() => {
        document.addEventListener('deviceready', onDeviceReady)

        return () => {
            document.removeEventListener('deviceready', onDeviceReady)
        }
    })

    return (
        <CordovaContext.Provider value={{
            isDeviceReady,
            platformId,
            listen,
            unlisten
        }}>
            {children}
        </CordovaContext.Provider>
    )
})

const useCordova = (waitForDeviceReady = false) => {
    const cordova = useContext(CordovaContext)!

    if (waitForDeviceReady && !cordova.isDeviceReady) {
        throw new Promise(() => { })
    }

    return cordova
}

export { CordovaProvider, useCordova }