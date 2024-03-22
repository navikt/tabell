import styled  from 'styled-components'
import { Table } from '@navikt/ds-react'

export const TableDiv = styled.div`
  &.error {
    border-color: var(--a-border-danger) !important;
    border-width: 3px !important;
    border-style: solid !important;
  }
`
export const ContentDiv = styled.div`
  position: relative;
`
export const LoadingDiv = styled.div` 
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.1);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
export const WideTable = styled(Table)<{size: 'small' | 'medium', cellSpacing: string, width: string}>`
  width: ${({width}) => width};
`
export const FilterIcon = styled.div`
  margin-left: 0.5rem;
  cursor: pointer;
`
export const CenterTh = styled.th`
  text-align: center !important;
`
export const BlueText = styled.div`
  color: var(--navds-link-color-text);
  font-weight: 400;
`
