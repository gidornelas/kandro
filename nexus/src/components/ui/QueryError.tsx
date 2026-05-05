interface QueryErrorProps {
  message: string
  onRetry?: () => void
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 flex-1 p-6">
      <div role="alert" aria-live="polite" className="p-3 rounded-lg max-w-[400px] alert-error border text-sm text-center">
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white border-none font-body text-sm font-semibold cursor-pointer"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
