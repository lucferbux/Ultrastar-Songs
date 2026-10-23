import { Icon } from './Icon'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchField({ value, onChange, placeholder = 'Buscar', autoFocus }: Props) {
  return (
    <label className="search-field">
      <Icon name="search" size={17} strokeWidth={2.2} />
      <input
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="clear" aria-label="Borrar búsqueda" onClick={() => onChange('')}>
          <Icon name="xmark" size={11} strokeWidth={3} />
        </button>
      )}
    </label>
  )
}
