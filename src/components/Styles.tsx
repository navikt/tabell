import { slideInFromLeft } from '@navikt/hoykontrast'
import styled  from 'styled-components'
import { Table } from '@navikt/ds-react'

export const TableDiv = styled.div<{coloredSelectedRow: boolean}>`
  .tabell td,
  .tabell th,
  .tabell .tabell__td,
  .tabell .tabell__th {
    padding: inherit;
    vertical-align: baseline;
    &.center {
      text-align: center
    }
    &.right {
      text-align: right
    }
     &.left {
      text-align: left
    }
  }
  tr:not(:hover) div.tabell__buttons,
  tr.tabell__tr--disabled div.tabell__buttons {
    visibility: hidden;
  } 
  td, th {
    padding: 0.35rem !important;
  }
  .tabell thead th div.selectall button::after {
    content: none !important; /* clean up the sort arrows for select all th */
  }
  .tabell thead th div.selectall {
    text-align: center;   
  }
  thead th button {
    white-space: break-spaces !important;
    margin: 0rem !important;
    padding: 0rem 0.2rem !important;
    width: 100% !important;
    display: contents;
    color: var(--a-surface-action-hover);
  }
  tbody tr button.expandingButton {
    padding: 0.2rem;
  }
  &.error {
    border-color: var(--a-border-danger) !important;
    border-width: 3px !important;
    border-style: solid !important;
  }
  .clickable {
    cursor: pointer;
  }
  thead th.noborder {
     border-bottom: none !important;
  }
  &__subcell {
    display: flex;
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  }
  &___seefilters-icon {
    cursor: pointer;
  }
  &__pagination {
    justify-content: flex-end;
  }
  .header {
    cursor: pointer;
  }
  th.buttons {
     width: 1px;
  }
  
  tr.slideAnimate {
    opacity: 0;
    transform: translateX(-20px);
    animation: ${slideInFromLeft(20)} 0.2s forwards;
  }
  tbody tr:hover:not(.tabell__tr--disabled) td {
    background: var(--a-surface-action-subtle-hover) !important;
  }
  .tabell__tr--disabled {
    background: var(--a-surface-subtle) !important;
    color: var(--a-text-default) !important;
    * {
      color: var(--a-text-default) !important;
    }
  }

  .tabell thead th button, .tabell .tabell__thead th button, .tabell thead .tabell__th button, .tabell .tabell__thead .tabell__th button {
    display: flex;
    color: var(--a-surface-action) !important;
    &:hover:not(:disabled) {
      color: var(--a-surface-action) !important;
      border-color: var(--a-surface-action) !important;
    }
    &:focus {
      box-shadow: 0 0 0 3px var(--a-border-focus) !important;
    } 
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
