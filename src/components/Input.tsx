import _ from 'lodash'
import { TextField } from '@navikt/ds-react'
import React, { useState } from 'react'

export interface InputProps {
  ariaLabel ?: string
  className ?: string
  error?: string | null | undefined
  id: string
  hideLabel?: boolean
  label: string
  onChanged: (e: string) => void
  onEnterPress?: (e: string) => void
  placeholder?: string
  required ?: boolean
  size?: 'medium' | 'small'
  style ?: any
  type?: "number" | "text" | "email" | "password" | "tel" | "url" | undefined
  value: string | undefined
}
const Input: React.FC<InputProps> = ({
  ariaLabel,
  className,
  error,
  hideLabel = true,
  id,
  label,
  onChanged,
  onEnterPress,
  placeholder,
  required = false,
  type = 'text',
  size = 'medium',
  style={},
  value
}: InputProps) => {
  const [_value, _setValue] = useState<string>(value ?? '')
  const [_dirty, _setDirty] = useState<boolean>(false)

  return (
    <TextField
      aria-invalid={!!error}
      aria-label={ariaLabel ?? label}
      className={className}
      data-testid={id}
      error={error}
      hideLabel={hideLabel}
      id={id}
      size={size}
      style={style}
      label={label}
      onBlur={() => {
        if (_dirty) {
          onChanged(_value)
          _setDirty(false)
        }
      }}
      onKeyPress={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && _.isFunction(onEnterPress)) {
          e.preventDefault()
          e.stopPropagation()
          onEnterPress(_value)
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
