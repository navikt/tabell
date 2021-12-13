import { slideInFromLeft } from 'nav-hoykontrast'
import styled from 'styled-components'
import { Table } from '@navikt/ds-react'

export const TableDiv = styled.div<{coloredSelectedRow: boolean}>`
  .tabell td,
  .tabell th,
  .tabell .tabell__td,
  .tabell .tabell__th {
    padding: inherit;
  }

  display: block !important;
  tr:not(:hover) div.tabell__buttons,
  tr.tabell__tr--disabled div.tabell__buttons {
    visibility: hidden;
  } 
  &.compact {
    td, th {
      padding: 0.35rem !important;
    }
    thead th button {
      white-space: break-spaces !important;
      margin: 0rem !important;
      padding: 0rem 0.2rem !important;
      width: 100% !important;
      display: contents;
      color: var(--navds-semantic-color-interaction-primary-hover);
    }
  }
  tr.tabell__tr--valgt td {
    background: ${(props) => props.coloredSelectedRow ? 'var(--navds-semantic-color-interaction-primary-default)' : 'inherit'};
  }
  &.error {
    border-color: var(--navds-tag-color-error-border) !important;
    border-width: 3px !important;
    border-style: solid !important;
  }
  .tabell__edit {
    vertical-align: top;
    td p {
      line-height: 2rem !important;
    }
  }
  .clickable {
    cursor: pointer;
  }
  thead th.noborder {
     border-bottom: none !important;
  }
  tbody.striped {  
    tr:nth-child(odd) {
      background: var(--navds-semantic-color-canvas-background);
    }
    tr:nth-child(even) {
      background: var(--navds-semantic-color-component-background-light);  
    }
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
  tr.slideAnimate {
    opacity: 0;
    transform: translateX(-20px);
    animation: ${slideInFromLeft(20)} 0.2s forwards;
  }
  tbody tr:hover:not(.tabell__tr--disabled) td {
    background: var(--navds-semantic-color-interaction-primary-hover) !important;
  }
  .tabell__tr--disabled {
    background: var(--navds-semantic-color-component-background-alternate) !important;
    color: var(--navds-semantic-color-text) !important;
    * {
      color: var(--navds-semantic-color-text) !important;
    }
  }

  .tabell thead th button, .tabell .tabell__thead th button, .tabell thead .tabell__th button, .tabell .tabell__thead .tabell__th button {
    color: var(--navds-semantic-color-interaction-primary-default) !important;
    &:hover:not(:disabled) {
      color: var(--navds-semantic-color-interaction-primary-default) !important;
      border-color: var(--navds-semantic-color-interaction-primary-default) !important;
    }
    &:focus {
      box-shadow: 0 0 0 3px var(--navds-semantic-color-focus) !important;
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
export const WideTable = styled(Table)<{size: 'small' | 'medium', cellSpacing: string}>`
  width: 100%;
`
export const FilterIcon = styled.div`
  margin-left: 0.5rem;
  cursor: pointer;
`
export const CenterTh = styled.th`
  text-align: center !important;
`
