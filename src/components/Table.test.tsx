import {screen, render, fireEvent, within} from '@testing-library/react'
import React from 'react'
import Table from './Table'
import { Item, TableProps } from 'index.d'

jest.mock('md5', () => ('mock-md5'))

type MockObject = {
  label: string
}

describe('Table', () => {
  const initialMockProps: TableProps = {
    columns: [
      { id: 'string', label: 'ui:string', type: 'string' },
      { id: 'date', label: 'ui:date', type: 'date' },
      {
        id: 'object',
        label: 'ui:variant',
        type: 'object',
        needle: (it: Item) => it.label.toLowerCase(),
        render: ({value}) => {
          return <span>{value?.label}</span>
        }
      }
    ],
    items: [
      { key: '01', string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' } as MockObject },
      { key: '02', string: 'String 02', date: new Date(2020, 1, 2), object: { label: 'Object 02' } as MockObject },
      { key: '03', string: 'String 03', date: new Date(2020, 1, 3), object: { label: 'Object 03' } as MockObject },
      { key: '04', string: 'String 04', date: new Date(2020, 1, 4), object: { label: 'Object 04' } as MockObject },
      { key: '05', string: 'String 05', date: new Date(2020, 1, 5), object: { label: 'Object 05' } as MockObject },
      { key: '06', string: 'String 06', date: new Date(2020, 1, 6), object: { label: 'Object 06' } as MockObject },
      { key: '07', string: 'String 07', date: new Date(2020, 1, 7), object: { label: 'Object 07' } as MockObject },
      { key: '08', string: 'String 08', date: new Date(2020, 1, 8), object: { label: 'Object 08' } as MockObject },
      { key: '09', string: 'String 09', date: new Date(2020, 1, 9), object: { label: 'Object 09' } as MockObject },
      { key: '10', string: 'String 10', date: new Date(2020, 1, 10), object: { label: 'Object 10' } as MockObject },
      { key: '11', string: 'String 11', date: new Date(2020, 1, 11), object: { label: 'Object 11' } as MockObject }
    ],
    loading: false,
    labels: {
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

  it('Renders', () => {
    const { container } = render(<Table {...initialMockProps} />)
    expect(container).not.toBeEmptyDOMElement();
  })

/*  it('Renders: Not sortable', () => {
    wrapper = render(<Table {...initialMockProps} sortable={false} />)
    expect(wrapper.find('thead tr th').last().exists('a')).toBeFalsy()
  })*/

    it('Has proper HTML structure: loading', () => {
      const { container } = render(<Table {...initialMockProps} />)
      expect((container.querySelectorAll('.tabell__table')).length).toBeGreaterThan(0);
    })

  it('Sort order ascending', () => {
    render(<Table {...initialMockProps} />)

    const sortButton = screen.getByRole('button', { name: /ui:date/i })
    fireEvent.click(sortButton);

    const bodyRows = screen.getAllByRole('rowgroup')[1];
    const firstBodyRow = within(bodyRows).getAllByRole('row')[0];

    expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(firstBodyRow).toHaveAttribute('id', 'test-Row-01');
  })

  it('Sort order descending', () => {
    render(<Table {...initialMockProps} />)

    const sortButton = screen.getByRole('button', { name: /ui:date/i })
    fireEvent.click(sortButton);
    fireEvent.click(sortButton);

    const bodyRows = screen.getAllByRole('rowgroup')[1];
    const firstBodyRow = within(bodyRows).getAllByRole('row')[0];

    expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'descending');
    expect(firstBodyRow).toHaveAttribute('id', 'test-Row-11');
  })

      it('onCheckAllClicked triggered', () => {
        (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
        render(<Table {...initialMockProps} />)

        fireEvent.click(document.querySelector('.tabell__checkAll-checkbox input')!);
        expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith(initialMockProps.items!.map((item: Item) => ({
          ...item,
          selected: true
        })));

        fireEvent.click(document.querySelector('.tabell__checkAll-checkbox input')!);
        expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([])
      })
  /*
      it('onCheckClicked triggered to select and deselect', () => {
        (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
        wrapper.find('input[data-test-id="tabell-test__row-select-01"]').hostNodes().first().simulate('change', { target: { checked: true } })
        expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith(
          [{ key: '01', selected: true, string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' }, sortKey: 'object 01', visible: true }]
        )
        wrapper.find('input[data-test-id="tabell-test__row-select-01"]').hostNodes().first().simulate('change', { target: { checked: true } })
        expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([])
      })

      it('should return one in onRowSelectChange if one row is selected, return two if another row is selected', () => {
        (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
        expect(initialMockProps.onRowSelectChange).not.toHaveBeenCalled()
        wrapper.find('input[data-test-id="tabell-test__row-select-01"]').hostNodes().first().simulate('change', { target: { checked: true } })
        expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([
          { key: '01', selected: true, string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' }, sortKey: 'object 01', visible: true }
        ])
        wrapper.find('input[data-test-id="tabell-test__row-select-02"]').hostNodes().first().simulate('change', { target: { checked: true } })
        expect(initialMockProps.onRowSelectChange).toHaveBeenCalledWith([
          { key: '01', selected: true, string: 'String 01', date: new Date(2020, 1, 1), object: { label: 'Object 01' }, sortKey: 'object 01', visible: true },
          { key: '02', selected: true, string: 'String 02', date: new Date(2020, 1, 2), object: { label: 'Object 02' }, sortKey: 'object 02', visible: true }
        ])
      })

      it('handlefilterChange()', () => {
        (initialMockProps.onRowSelectChange as jest.Mock).mockReset()
        wrapper.find('.tabell___seefilters-icon').hostNodes().simulate('click')
        wrapper.update()
        const filterBox = wrapper.find('.tabell__sort-input input').hostNodes().first()
        filterBox.simulate('change', { target: { value: 'String 07' } })
        filterBox.simulate('blur')
        wrapper.update()
        expect(wrapper.find('tbody tr').length).toEqual(1)
        expect(wrapper.find('tbody tr').render().text()).toEqual(['String 07', '07/02/2020', 'Object 07'].join(''))
      })*/
})
