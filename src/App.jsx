import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import SiteLayout from './components/layout/SiteLayout';
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import EventPage from './pages/EventPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import AuthPage from './pages/AuthPage';
import ClientDashboard from './pages/client/ClientDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EventDetailsPage from './pages/organizer/EventDetailsPage';
import AdminPage from './pages/admin/AdminPage';
import CollectionsPage from './pages/CollectionsPage';
import OrganizerLandingPage from './pages/OrganizerLandingPage';
import { ContactsPage, AboutPage, NotFoundPage } from './pages/InfoPages'

/** При смене маршрута прокручиваем вверх; при наличии #hash — к секции. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/event/:slug" element={<EventPage />} />
          <Route path="/booking-confirmed" element={<BookingConfirmPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/create" element={<CreateEventPage />} />
          <Route path="/organizer/event/:slug" element={<EventDetailsPage />} />
          <Route path="/collections" element={<CollectionsPage/>} />
          <Route path="/collections/:id" element={<CollectionsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/organizer-landing" element={<OrganizerLandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
