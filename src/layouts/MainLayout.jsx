import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import WhatsAppButton from '../components/WhatsAppButton/WhatsAppButton'
import RouteTracker from '../components/Analytics/RouteTracker'

export default function MainLayout() {
  return (
    <div id="top" className="relative min-h-screen w-full bg-transparent">
      <RouteTracker />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
