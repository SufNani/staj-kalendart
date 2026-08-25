import { useEffect } from 'react'

/** Закрывает поповер по клику вне ref и по нажатию Escape. */
export default function useOutsideClick(ref, onClose, active = true) {
  useEffect(() => {
    if (!active) return
    function handlePointer(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [ref, onClose, active])
}
