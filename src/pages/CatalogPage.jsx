import { useSearchParams } from 'react-router-dom'
import CatalogSection from '../components/CatalogSection'
import { CATEGORIES } from '../data/events'

export default function CatalogPage() {
  const [params] = useSearchParams()
  const raw = params.get('category')
  const initialCategory = CATEGORIES.includes(raw) ? raw : null

  // key заставляет пересобрать секцию при смене категории из ссылки-подборки
  return <CatalogSection key={initialCategory || 'all'} initialCategory={initialCategory} />
}
