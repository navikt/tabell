import { HighContrastInput } from 'nav-hoykontrast'
import React, { useState } from 'react'

export interface InputProps {
  ariaLabel ?: string
  className ?: string
  feil?: string | null | undefined
  id: string
  label: JSX.Element | string
  onChanged: (e: string) => void
  placeholder?: string
  required ?: boolean
  type?: string
  value: string | undefined
}
const Input: React.FC<InputProps> = ({
  ariaLabel,
  className,
  feil,
  id,
  label,
  onChanged,
  placeholder,
  required = false,
  type = 'text',
  value
}: InputProps) => {
  const [_value, _setValue] = useState<string>(value ?? '')
  const [_dirty, _setDirty] = useState<boolean>(false)

  return (
    <HighContrastInput
      aria-invalid={!!feil}
      aria-label={ariaLabel ?? label}
      className={className}
      data-test-id={id}
      feil={feil}
      id={id}
      label={label}
      onBlur={() => {
        if (_dirty) {
          onChanged(_value)
          _setDirty(false)
        }
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()
        _setValue(e.target.value)
        _setDirty(true)
      }}
      placeholder={placeholder ?? ''}
      required={required}
      type={type}
      value={_value}
    />
  )
}

export default Input
