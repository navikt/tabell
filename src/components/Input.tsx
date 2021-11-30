import _ from 'lodash'
import { TextField } from '@navikt/ds-react'
import React, { useState } from 'react'

export interface InputProps {
  ariaLabel ?: string
  className ?: string
  feil?: string | null | undefined
  id: string
  label: string
  onChanged: (e: string) => void
  onEnterPress?: (e: string) => void
  placeholder?: string
  required ?: boolean
  type?: "number" | "text" | "email" | "password" | "tel" | "url" | undefined
  value: string | undefined
}
const Input: React.FC<InputProps> = ({
  ariaLabel,
  className,
  feil,
  id,
  label,
  onChanged,
  onEnterPress,
  placeholder,
  required = false,
  type = 'text',
  value
}: InputProps) => {
  const [_value, _setValue] = useState<string>(value ?? '')
  const [_dirty, _setDirty] = useState<boolean>(false)

  return (
    <TextField
      aria-invalid={!!feil}
      aria-label={ariaLabel ?? label}
      className={className}
      data-test-id={id}
      error={feil}
      id={id}
      label={label}
      onBlur={() => {
        if (_dirty) {
          onChanged(_value)
          _setDirty(false)
        }
      }}
      onKeyPress={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          if (_.isFunction(onEnterPress)) {
            onEnterPress(_value)
            _setDirty(false)
          }
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
