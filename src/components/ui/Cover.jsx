/* Заглушка обложки. Если у события есть `image` — показываем фото,
   иначе рисуем аккуратный тематический градиент с монограммой. */

export default function Cover({ image, gradient, label, initials, className = '', style }) {
  if (image) {
    return <img src={image} alt={label || ''} className={className} style={style} />
  }
  const [from, to] = gradient || ['#c8a86b', '#8a6f3e']
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: 'grid',
        placeItems: 'center',
        color: 'rgba(255,255,255,0.92)',
        ...style,
      }}
      role="img"
      aria-label={label || ''}
    >
      <span
        style={{
          fontFamily: 'var(--kt-font-display)',
          fontWeight: 700,
          fontSize: '1.6rem',
          letterSpacing: '0.04em',
          textShadow: '0 2px 12px rgba(0,0,0,0.25)',
        }}
      >
        {initials || (label ? label.slice(0, 2).toUpperCase() : '')}
      </span>
    </div>
  )
}
