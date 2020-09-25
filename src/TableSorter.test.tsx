import { mount, ReactWrapper } from 'enzyme'
import React from 'react'
import TableSorter, { TableSorterDiv } from './TableSorter'
import { Item, TableSorterProps } from './index.d'

describe('TableSorter', () => {
  let wrapper: ReactWrapper
  const initialMockProps: TableSorterProps = {
    columns: [
      { id: 'string', label: 'ui:string', type: 'string' },
      { id: 'date', label: 'ui:date', type: 'date' },
      {
        id: 'object',
        label: 'ui:variant',
        type: 'object',
        needle: (it: Item) => it.label.toLowerCase(),
        renderCell: (item: Item, value: any) => {
          return <span>{value.label}</span>
        }
      }
    ],
    items: [
      { key: '01', string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' } },
      { key: '02', string: 'String 02', date: new Date(2020, 1, 2), object: { label: 'Object 02' } },
      { key: '03', string: 'String 03', date: new Date(2020, 1, 3), object: { label: 'Object 03' } },
      { key: '04', string: 'String 04', date: new Date(2020, 1, 4), object: { label: 'Object 04' } },
      { key: '05', string: 'String 05', date: new Date(2020, 1, 5), object: { label: 'Object 05' } },
      { key: '06', string: 'String 06', date: new Date(2020, 1, 6), object: { label: 'Object 06' } },
      { key: '07', string: 'String 07', date: new Date(2020, 1, 7), object: { label: 'Object 07' } },
      { key: '08', string: 'String 08', date: new Date(2020, 1, 8), object: { label: 'Object 08' } },
      { key: '09', string: 'String 09', date: new Date(2020, 1, 9), object: { label: 'Object 09' } },
      { key: '10', string: 'String 10', date: new Date(2020, 1, 10), object: { label: 'Object 10' } },
      { key: '11', string: 'String 11', date: new Date(2020, 1, 11), object: { label: 'Object 11' } }
    ],
    loading: false,
    labels: {
      string: {
        'string 01': 'Tooltip for string 01',
        'string 02': 'Tooltip for string 02',
        'string 03': 'Tooltip for string 03',
        'string 04': 'Tooltip for string 04',
        'string 05': 'Tooltip for string 05',
        'string 06': 'Tooltip for string 06',
        'string 07': 'Tooltip for string 07',
        'string 08': 'Tooltip for string 08',
        'string 09': 'Tooltip for string 09',
        'string 10': 'Tooltip for string 10',
        'string 11': 'Tooltip for string 11'
      }
    },
    sortable: true,
    searchable: true,
    selectable: true,
    animatable: true,
    itemsPerPage: 5,
    onRowSelectChange: jest.fn(),
    pagination: true,
    id: 'test'
  }

  beforeEach(() => {
    wrapper = mount(<TableSorter {...initialMockProps} />)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('Renders', () => {
    expect(wrapper.isEmptyRender()).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('Renders: Not sortable', () => {
    wrapper = mount(<TableSorter {...initialMockProps} sortable={false} />)
    expect(wrapper.find('thead tr th').last().exists('a')).toBeFalsy()
  })

  it('Has proper HTML structure: loading', () => {
    expect(wrapper.exists(TableSorterDiv)).toBeTruthy()
  })

  it('UseEffect: new items', () => {
    wrapper.setProps({
      items: initialMockProps.items!.slice(initialMockProps.items!.length - 1)
    })
    wrapper.update()
    expect(wrapper.exists(TableSorterDiv)).toBeTruthy()
    expect(wrapper.find('tbody tr').length).toEqual(1)
  })

  it('Sort order', () => {
    let lastHeader = wrapper.find('thead tr th').last()
    expect(lastHeader.props().className).toEqual('header none')

    lastHeader.find('a').simulate('click')
    lastHeader = wrapper.find('thead tr th').last()
    expect(lastHeader.props().className).toEqual('header tabell__th--sortert-asc')

    lastHeader.find('a').simulate('click')
    lastHeader = wrapper.find('thead tr th').last()
    expect(lastHeader.props().className).toEqual('header tabell__th--sortert-desc')

    lastHeader.find('a').simulate('click')
    lastHeader = wrapper.find('thead tr th').last()
    expect(lastHeader.props().className).toEqual('header none')
  })

  it('onCheckAllClicked triggered', () => {
    (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
    wrapper.find('.c-tableSorter__checkAll-checkbox input').hostNodes().simulate('change', { target: { checked: true } })
    expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith(initialMockProps.items!.map((item: Item) => ({
      ...item,
      selected: true
    })));
    (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
    wrapper.find('.c-tableSorter__checkAll-checkbox input').hostNodes().simulate('change', { target: { checked: false } })
    expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([])
  })

  it('onCheckClicked triggered to select and deselect', () => {
    (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
    wrapper.find('input[data-testid="c-tableSorter__row-checkbox-id-01-test"]').hostNodes().first().simulate('change', { target: { checked: true } })
    expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith(
      [{ key: '01', selected: true, string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' }, visible: true }]
    )
    wrapper.find('input[data-testid="c-tableSorter__row-checkbox-id-01-test"]').hostNodes().first().simulate('change', { target: { checked: true } })
    expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([])
  })

  it('should return one in onRowSelectChange if one row is selected, return two if another row is selected', () => {
    (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
    expect(initialMockProps.onRowSelectChange).not.toHaveBeenCalled()
    wrapper.find('input[data-testid="c-tableSorter__row-checkbox-id-01-test"]').hostNodes().first().simulate('change', { target: { checked: true } })
    expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([
      { key: '01', selected: true, string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' }, visible: true }
    ])
    wrapper.find('input[data-testid="c-tableSorter__row-checkbox-id-02-test"]').hostNodes().first().simulate('change', { target: { checked: true } })
    expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([
      { key: '01', selected: true, string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' }, visible: true },
      { key: '02', selected: true, string: 'String 02', date: new Date(2020, 1, 2), object: { label: 'Object 02' }, visible: true }
    ])
  })

  it('handleFilterTextChange()', () => {
    (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
    wrapper.find('.c-tableSorter___seefilters-icon').hostNodes().simulate('click')
    wrapper.update()
    wrapper.find('.c-tableSorter__sort-input input').hostNodes().first().simulate('change', { target: { value: 'String 07' } })
    wrapper.update()
    expect(wrapper.find('tbody tr').length).toEqual(1)
    expect(wrapper.find('tbody tr').render().text()).toEqual(['Velg 07', 'String 07', '2/7/2020', 'Object 07'].join(''))
  })
})
