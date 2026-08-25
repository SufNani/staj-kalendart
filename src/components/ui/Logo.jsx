import { Link } from 'react-router-dom'
import logo from '../../assets/logo-full.png'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="kt-logo" aria-label="КалендАрт, на главную">
      <img className="kt-logo__img" src={logo} alt="КалендАрт" />
    </Link>
  )
}
