import { useState, useEffect } from 'react'
import { websiteAPI } from '../services/api'

export default function useWhatsAppNumber() {
  const [whatsappNumber, setWhatsappNumber] = useState('96899793939')

  useEffect(() => {
    let active = true
    websiteAPI.getHome()
      .then(data => {
        if (active && data?.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number)
        }
      })
      .catch(err => console.error('Failed to fetch whatsapp number', err))
    return () => { active = false }
  }, [])

  return whatsappNumber
}
