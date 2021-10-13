import { slideInFromLeft, themeKeys } from 'nav-hoykontrast'
import styled from 'styled-components'

export const TableDiv = styled.div<{coloredSelectedRow: boolean}>`
  display: block !important;
  * {
    font-size: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'} !important;
    line-height: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'} !important;
  }
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
      color:  ${({ theme }) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]};
    }
  }
  tr.tabell__tr--valgt td {
    background: ${(props) => props.coloredSelectedRow ? props.theme[themeKeys.ALTERNATIVE_HOVER_COLOR] : 'inherit'};
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
      background: ${({ theme }) => theme[themeKeys.MAIN_BACKGROUND_COLOR]};
    }
    tr:nth-child(even) {
      background: ${({ theme }) => theme[themeKeys.ALTERNATIVE_BACKGROUND_COLOR]};   
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
    background: ${({ theme }) => theme[themeKeys.MAIN_HOVER_COLOR]} !important;
  }
  .tabell__tr--disabled {
    background: ${({ theme }: any) => theme[themeKeys.MAIN_DISABLED_COLOR]} !important;
    color: ${({ theme }: any) => theme[themeKeys.GRAYINACTIVE]} !important;
    * {
      color:  ${({ theme }: any) => theme[themeKeys.GRAYINACTIVE]} !important;
    }
  }
  .tabell thead th button, .tabell .tabell__thead th button, .tabell thead .tabell__th button, .tabell .tabell__thead .tabell__th button {
    color: ${({ theme }: any) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]} !important;
    &:hover:not(:disabled) {
      color: ${({ theme }: any) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]} !important;
      border-color: ${({ theme }: any) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]} !important;
    }
    &:focus {
      box-shadow: 0 0 0 3px ${({ theme }: any) => theme[themeKeys.MAIN_FOCUS_COLOR]} !important;
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
export const WideTable = styled.table`
  width: 100%;
`
export const FilterIcon = styled.div`
  margin-left: 0.5rem;
  cursor: pointer;
`
export const CenterTh = styled.th`
  text-align: center !important;
`
