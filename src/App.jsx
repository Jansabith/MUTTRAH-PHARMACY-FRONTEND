import { useCallback, useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import SplashScreen from './components/SplashScreen/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashComplete = useCallback(() => setShowSplash(false), [])

  return (
    <>
      <AppRoutes />
      {showSplash ? <SplashScreen onComplete={handleSplashComplete} /> : null}
    </>
  )
}

export default App
