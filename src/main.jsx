import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { EventsProvider } from './store/EventsContext.jsx'
import { ProfileProvider } from './store/ProfileContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <EventsProvider>
          <App />
        </EventsProvider>
      </ProfileProvider>
    </BrowserRouter>
  </React.StrictMode>
)
