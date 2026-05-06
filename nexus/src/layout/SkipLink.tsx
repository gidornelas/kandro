export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '8px',
        zIndex: 100,
        padding: '8px 14px',
        background: 'var(--color-accent)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'top .2s ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '8px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px'
      }}
    >
      Pular para conteúdo principal
    </a>
  )
}
