import React from 'react'

function ToolbarBtn({ cmd, arg, icon, label, onClick }: { cmd: string; arg?: string; icon: string; label: string; onClick: (cmd: string, arg?: string) => void }) {
  return (
    <button
      title={label}
      onClick={() => onClick(cmd, arg)}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        fontSize: cmd === 'formatBlock' ? '10px' : '13px',
        fontWeight: cmd === 'bold' || cmd === 'formatBlock' ? 700 : 400,
        fontStyle: cmd === 'italic' ? 'italic' : 'normal',
        textDecoration: cmd === 'underline' ? 'underline' : cmd === 'strikeThrough' ? 'line-through' : 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all .12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(47,128,237,.12)'; e.currentTarget.style.color = 'var(--color-accent)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
    >
      {icon}
    </button>
  )
}

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [focused, setFocused] = React.useState(false)

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div
      style={{
        background: focused ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.45)',
        border: `1px solid ${focused ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all .15s',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '6px 8px',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'rgba(255,255,255,.55)',
          flexWrap: 'wrap',
        }}
      >
        <ToolbarBtn cmd="bold" icon="B" label="Negrito" onClick={exec} />
        <ToolbarBtn cmd="italic" icon="I" label="Itálico" onClick={exec} />
        <ToolbarBtn cmd="underline" icon="U" label="Sublinhado" onClick={exec} />
        <ToolbarBtn cmd="strikeThrough" icon="S" label="Tachado" onClick={exec} />
        <span style={{ width: '1px', height: '18px', background: 'var(--color-border-subtle)', margin: '0 4px' }} />
        <ToolbarBtn cmd="formatBlock" arg="H1" icon="H1" label="Título 1" onClick={exec} />
        <ToolbarBtn cmd="formatBlock" arg="H2" icon="H2" label="Título 2" onClick={exec} />
        <span style={{ width: '1px', height: '18px', background: 'var(--color-border-subtle)', margin: '0 4px' }} />
        <ToolbarBtn cmd="insertUnorderedList" icon="•" label="Lista" onClick={exec} />
        <ToolbarBtn cmd="insertOrderedList" icon="1." label="Lista numerada" onClick={exec} />
        <span style={{ width: '1px', height: '18px', background: 'var(--color-border-subtle)', margin: '0 4px' }} />
        <ToolbarBtn cmd="justifyLeft" icon="⬅" label="Alinhar esquerda" onClick={exec} />
        <ToolbarBtn cmd="justifyCenter" icon="↔" label="Centralizar" onClick={exec} />
        <ToolbarBtn cmd="justifyRight" icon="➡" label="Alinhar direita" onClick={exec} />
        <span style={{ width: '1px', height: '18px', background: 'var(--color-border-subtle)', margin: '0 4px' }} />
        <ToolbarBtn cmd="removeFormat" icon="✕" label="Limpar formatação" onClick={exec} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          if (editorRef.current) onChange(editorRef.current.innerHTML)
        }}
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML) }}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: '100px',
          maxHeight: '240px',
          overflowY: 'auto',
          padding: '10px 12px',
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
          outline: 'none',
        }}
      />
    </div>
  )
}
