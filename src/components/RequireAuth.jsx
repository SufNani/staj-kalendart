import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

/**
 * Пропускает дальше только вошедших пользователей.
 * Не вошёл -> редирект на /login, с запоминанием, куда он шёл
 * (после входа/регистрации можно вернуть его туда же).
 *
 * Пока идёт восстановление сессии по токену (только в боевом режиме,
 * на доле секунды при обновлении страницы) — не редиректим сразу,
 * иначе только что вошедшего организатора будет мотать на /login
 * и обратно, пока профиль не подгрузится.
 */
export default function RequireAuth() {
  const { isAuth, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="kt-authgate">Проверяем вход…</div>
  }
  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
