import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'
import { USE_MOCKS } from '../config'
import { CURRENT_USER, ORGANIZER } from '../data/site'

/* ============================================================
   Личность пользователя: токен, имя, телефон, роль.

   Раздельно от ProfileContext: там — локальные данные кабинета
   (аватар, анкета студии, интересы), для которых у бэкенда пока
   нет ручек сохранения. Здесь — то, что реально приходит с сервера.

   USE_MOCKS=true  -> демо без бэкенда, роль хранится тут же.
   USE_MOCKS=false -> реальные запросы к API.
   ============================================================ */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!USE_MOCKS && Boolean(getToken()))

  // Восстанавливаем сессию по сохранённому токену
  useEffect(() => {
    if (USE_MOCKS || !getToken()) return
    let cancelled = false
    authApi
      .fetchMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (form) => {
    if (USE_MOCKS) {
      const mock =
        form.role === 'organizer'
          ? { ...ORGANIZER, role: 'organizer' }
          : { ...CURRENT_USER, role: 'client' }
      setUser(mock)
      return mock
    }
    const { user: u } = await authApi.login(form)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (form) => {
    if (USE_MOCKS) {
      const mock =
        form.role === 'organizer'
          ? { ...ORGANIZER, name: form.name || ORGANIZER.name, role: 'organizer' }
          : { ...CURRENT_USER, name: form.name || CURRENT_USER.name, role: 'client' }
      setUser(mock)
      return mock
    }
    const { user: u } = await authApi.register(form)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    if (!USE_MOCKS) await authApi.logout()
    setUser(null)
  }, [])

  /** Удаление аккаунта. В API-режиме реально удаляет на сервере
   *  (DELETE /api/users) и сбрасывает токен; в демо — просто выходит,
   *  удалять на сервере нечего. */
  const deleteAccount = useCallback(async () => {
    if (!USE_MOCKS) await authApi.deleteAccount()
    setUser(null)
  }, [])

  /** Обновление профиля: имя/телефон/город/анкета студии.
   *  В API-режиме реально сохраняет на сервере (PATCH /api/users/profile).
   *  В демо-режиме просто держит правки в памяти на время сессии. */
  const updateUser = useCallback(async (patch) => {
    if (USE_MOCKS) {
      setUser((prev) => (prev ? { ...prev, ...patch } : prev))
      return
    }
    const updated = await authApi.updateProfile(patch)
    setUser(updated)
    return updated
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAuth: Boolean(user), login, register, logout, updateUser, deleteAccount }),
    [user, loading, login, register, logout, updateUser, deleteAccount]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри <AuthProvider>')
  return ctx
}
