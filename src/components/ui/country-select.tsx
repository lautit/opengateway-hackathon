import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export type Country = { code: string; flag: string; label: string }

export interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
  countries: Country[]
  className?: string
  'aria-label'?: string
  showFlagInTrigger?: boolean
  dropdownWidthClass?: string
  showLabelInDropdown?: boolean
}

export function CountrySelect({ value, onChange, countries, className, showFlagInTrigger = true, dropdownWidthClass, showLabelInDropdown = false, ...props }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const selected = React.useMemo(
    () => countries.find((c) => c.code === value) ?? countries[0],
    [countries, value]
  )

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-12 w-full items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-base text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9b8]',
          'transition-all duration-300 cursor-pointer'
        )}
        {...props}
      >
        {showFlagInTrigger && <span className="text-xl">{selected.flag}</span>}
        <span className="font-medium">{selected.code}</span>
        <svg
          className={cn(
            'ml-auto h-4 w-4 transition-transform',
            open ? 'rotate-180 text-[#00d9b8] scale-110' : 'text-gray-400'
          )}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {open && (
        <ul className={cn(
          "absolute left-0 mt-1 z-50 rounded-lg border border-gray-700 bg-gray-900/95 text-white shadow-xl max-h-56 overflow-auto",
          dropdownWidthClass ?? "w-full"
        )}>
          {countries.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => {
                  onChange(c.code)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full min-w-0 items-center gap-2 px-3 py-2 text-sm hover:bg-white/10',
                  c.code === value && 'bg-white/10'
                )}
              >
                <span className="text-xl">{c.flag}</span>
                <span className="font-mono">{c.code}</span>
                {showLabelInDropdown && (
                  <span className="ml-auto text-xs text-gray-400 truncate">{c.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
