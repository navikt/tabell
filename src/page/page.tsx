import Input from 'components/Input'
import React, { useEffect, useState } from 'react'
import Mustache from 'mustache'
import { Detail, Checkbox, Link, Select, BodyLong, Heading, Table } from '@navikt/ds-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import dark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark'
import light from 'react-syntax-highlighter/dist/esm/styles/prism/prism'
import styled, { createGlobalStyle } from 'styled-components'
import NavHighContrast, { VerticalSeparatorDiv } from '@navikt/hoykontrast'
import NavTable from 'components/Table'
import { Column, Item } from 'index.d'
import '@navikt/ds-css'

SyntaxHighlighter.registerLanguage('jsx', jsx)

const PaddedDiv = styled.div`
  padding:3rem;
`
const HeaderDiv = styled.div`
 display: flex;
 flex-direction: row;
 justify-content: flex-end;
`
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    color: var(--navds-color-text-primary);
    background-color: var(--navds-semantic-color-canvas-background);
    line-height: 1.42857143;
    font-family: 'Source Sans Pro', Arial, sans-serif;
  }
`
const SmallDiv = styled.div`
  width: 33%;
  margin-right: 1rem;
`
const SmallSelect = styled(Select)`
  width: 33%;
  margin-right: 1rem;
`
const FlexDiv = styled.div`
  display: flex;
`
const MarginTable = styled(NavTable)`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;  
  width: 100%;
`

const Page: React.FC<any> = ({ highContrast }: any): JSX.Element => {

  const [_highContrast, _setHighContrast] = useState<boolean>(highContrast)
  const [allowNewRows, setAllowNewRows] = useState<boolean>(true)
  const [animatable, setAnimatable] = useState<boolean>(true)
  const [categories, setCategories] = useState<boolean>(true)
  const [coloredSelectedRow, setColoredSelectedRow] = useState<boolean>(true)
  const [editable, setEditable] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [flaggable, setFlaggable] = useState(true)
  const [flagIkon, setFlagIkon] = useState<string | undefined>(undefined)
  const [fullWidth, setFullWidth] = useState<boolean>(true)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState(true)
  const [searchable, setSearchable] = useState(true)
  const [selectable, setSelectable] = useState(true)
  const [showSelectAll, setShowSelectAll] = useState(true)
  const [sortable, setSortable] = useState(true)
  const [striped, setStriped] = useState(true)
  const [summary, setSummary] = useState(true)
  const [size, setSize] = useState<'medium' | 'small' | undefined> ('medium')
  const [subrowsIcon, setSubrowsIcon] = useState<string>('arrow')

  useEffect(() => {
    if (!(highContrast === undefined || highContrast === null)) {
      _setHighContrast(highContrast)
    }
  }, [highContrast])

  let columns: Array<Column> = [
    { id: 'name', label: 'Name', type: 'string' },
    { id: 'date', label: 'Date', type: 'date', align: 'center',
      edit: {
        validation: [{
          mandatory: true,
          test: '^\d\d/\d\d/\d\d\d\d$',
          message: 'Use DD/MM/YYYY pattern'
        }]
      }},
    {
      id: 'type',
      label: 'Occupation',
      type: 'string',
      render: ({value}: any) => <Detail>{value}</Detail>
    }
  ]

  if (editable) {
    columns.push({id: 'buttons', label: '', type: 'buttons'})
  }

  let items: Array<Item> = [
    { key: '01', name: 'Anna', date: new Date(1970, 2, 4), type: 'Analyst', selected: true, flag: true, editDisabled: true },
    { key: '02', name: 'Bernard', date: new Date(1980, 4, 8), type: 'Bookkeeper', disabled: true },
    { key: '03', hasSubrows: true, openSubrows: false, name: 'Claire', date: new Date(1972, 6, 12), type: 'CEO' },
    { key: '03_01', parentKey: '03', name: 'Charles', date: new Date(1970, 2, 4), type: 'co-CEO', selected: true },
    { key: '03_02', parentKey: '03', name: 'Chad', date: new Date(1970, 2, 4), type: 'co-CEO', selected: false },
    { key: '03_03', parentKey: '03', name: 'Christine', date: new Date(1970, 2, 4), type: 'co-CEO', selected: false },
    { key: '04', name: 'Daniel', date: new Date(1946, 2, 24), type: 'Developer' },
    { key: '05', name: 'Emma', date: new Date(1947, 7, 1), type: 'Economist', selected: true },
    { key: '06', name: 'Frank', date: new Date(1978, 11, 14), type: 'Freelancer' },
    { key: '07', name: 'Gwyneth', date: new Date(1992, 1, 4), type: 'Geographer' },
    { key: '08', name: 'Howard', date: new Date(2001, 9, 19), type: 'HR head', disabled: true },
    { key: '09', name: 'Iva', date: new Date(1925, 6, 12), type: 'Investor', selected: true },
    { key: '10', name: 'John', date: new Date(1994, 3, 2), type: 'Journalist' },
    { key: '11', name: 'Karen', date: new Date(1999, 9, 22), type: 'Knowledge engineer' },
    { key: '12', name: 'Leonard', date: new Date(1991, 10, 26), type: 'Lawyer' },
    { key: '13', name: 'Mary', date: new Date(1962, 10, 25), type: 'Marketing' },
    { key: '14', name: 'Neville', date: new Date(1983, 1, 22), type: 'Nurse' },
    { key: '15', name: 'Olivia', date: new Date(1992, 7, 2), type: 'Operations manager', selected: true },
    { key: '16', name: 'Peter', date: new Date(1927, 6, 13), type: 'Project manager' },
    { key: '17', name: 'Quincey', date: new Date(1965, 3, 11), type: 'Quality control' },
    { key: '18', name: 'Ronald', date: new Date(1982, 8, 18), type: 'Realtor', disabled: true },
    { key: '19', name: 'Sally', date: new Date(1942, 8, 20), type: 'Sales manager' },
    { key: '20', name: 'Ted', date: new Date(1968, 3, 22), type: 'Tester' },
    { key: '21', name: 'Uma', date: new Date(1985, 9, 17), type: 'UI expert', selected: true },
    { key: '22', name: 'Victor', date: new Date(2012, 12, 13), type: 'Video editor' },
    { key: '23', name: 'Wanda', date: new Date(1947, 2, 2), type: 'Web designer', disabled: true },
    { key: '24', name: 'Xavier', date: new Date(1932, 7, 5), type: 'XML developer' },
    { key: '25', name: 'Yvonne', date: new Date(1993, 2, 28), type: 'Yoga instructor' },
    { key: '26', name: 'Ziggy', date: new Date(1929, 1, 14), type: 'Zoo keeper' }
  ]

  let readyItems = items.map((it: Item) => {
    it.flagIkon = flagIkon
    return it
  })

  return (
    <>
      <GlobalStyle />
      <NavHighContrast highContrast={_highContrast}>
        <PaddedDiv>
          {(highContrast === undefined || highContrast === null) && (
            <HeaderDiv>
              <Link
                id='highcontrast-link-id'
                href='#highContrast'
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  _setHighContrast(!_highContrast)
                }}
              >
                high contrast
              </Link>
            </HeaderDiv>
          )}
          <VerticalSeparatorDiv size='2'/>
          <Heading size="medium">
            Table Sorter
          </Heading>
          <VerticalSeparatorDiv size='2'/>
          <BodyLong>
            Table with sorting, searching, selecting capabilities
          </BodyLong>
          <VerticalSeparatorDiv size='2'/>
          <FlexDiv>
            <SmallDiv>
              <Checkbox checked={allowNewRows} onChange={() => setAllowNewRows(!allowNewRows)} >Allow new rows</Checkbox>
              <Checkbox checked={animatable} onChange={() => setAnimatable(!animatable)} >Row animation</Checkbox>
              <Checkbox checked={categories} onChange={() =>  setCategories(!categories)} >Add categories</Checkbox>
              <Checkbox checked={coloredSelectedRow} onChange={() => setColoredSelectedRow(!coloredSelectedRow)} >Add color to selected row</Checkbox>
              <Checkbox checked={editable} onChange={() => setEditable(!editable)} >Editable table</Checkbox>
              <Checkbox checked={error} onChange={() => setError(!error)} >Table error</Checkbox>
              <Checkbox checked={flaggable} onChange={() => setFlaggable(!flaggable)} >Flaggable table</Checkbox>
              <Checkbox checked={fullWidth} onChange={() => setFullWidth(!fullWidth)} >Full width table</Checkbox>
            </SmallDiv>
            <SmallDiv>
              <Input
                id='flag icon'
                label='flag icon'
                hideLabel={false}
                value={flagIkon}
                onChanged={setFlagIkon}
              />
              <SmallSelect
                label='Number of items per page'
                value={itemsPerPage}
                onChange={(e: any) => setItemsPerPage(parseInt(e.target.value, 10))}
              >
                <option>2</option>
                <option>5</option>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </SmallSelect>
              <Checkbox checked={loading} onChange={() => setLoading(!loading)} >Loading table</Checkbox>
              <Checkbox checked={pagination} onChange={() => setPagination(!pagination)} >Add pagination</Checkbox>
              <Checkbox checked={searchable} onChange={() => setSearchable(!searchable)} >Searchable table</Checkbox>
              <Checkbox checked={selectable} onChange={() => setSelectable(!selectable)} >Selectable table</Checkbox>
            </SmallDiv>
            <SmallDiv>
              <Checkbox checked={showSelectAll} onChange={() => setShowSelectAll(!showSelectAll)} >Show 'select all' checkbox</Checkbox>
              <Checkbox checked={size === 'small'} onChange={() => setSize(size === 'small' ? 'medium' : 'small')}>Switch to small size</Checkbox>
              <Checkbox checked={sortable} onChange={() => setSortable(!sortable)} >Sortable table</Checkbox>
              <SmallSelect
                label='Subrows Icon'
                value={subrowsIcon}
                onChange={(e: any) => setSubrowsIcon(e.target.value)}
              >
                <option>arrow</option>
                <option>merge</option>
              </SmallSelect>
              <Checkbox checked={striped} onChange={() => setStriped(!striped)} >Striped table</Checkbox>
              <Checkbox checked={summary} onChange={() => setSummary(!summary)} >Add summary</Checkbox>
            </SmallDiv>
          </FlexDiv>
          <FlexDiv>

          </FlexDiv>
          <VerticalSeparatorDiv size='2'/>

          <MarginTable
            id='Employees-Table'
            columns={columns}
            items={readyItems}
            allowNewRows={allowNewRows}
            animatable={animatable}
            beforeRowAdded={(columns, context) => {
              console.log('beforeRowAdded called with ', columns, context)
              return undefined
            }}
            beforeRowEdited={(item, context) => {
              console.log('beforeRowEdited called with ', item, context)
              return undefined
            }}
            categories={categories ? [{
                colSpan: 3,
                label: 'Category',
                border: true
              }] : undefined}
            coloredSelectedRow={coloredSelectedRow}
            editable={editable}
            error={error ? 'This table has an error' : undefined}
            flaggable={flaggable}
            flagIkon={flagIkon}
            fullWidth={fullWidth}
            itemsPerPage={itemsPerPage}
            loading={loading}
            pagination={pagination}
            searchable={searchable}
            selectable={selectable}
            showSelectAll={showSelectAll}
            size={size}
            sortable={sortable}
            striped={striped}
            summary={summary}
            subrowsIcon={subrowsIcon as 'arrow' | 'merge' | undefined}
          />
          <VerticalSeparatorDiv size='2'/>
          <SyntaxHighlighter language='javascript' style={_highContrast ? dark : light}>
            {Mustache.render('<TableSorter\n' +
              '   columns={ {{{columns}}} }\n' +
              '   items={ {{{items}}} }\n' +
              '   allowNewRows={ {{allowNewRows}} }\n' +
              '   animatable={ {{animatable}} }\n' +
              '   categories={ {{{categories}}} }\n' +
              '   coloredSelectedRow={ {{coloredSelectedRow}} }\n' +
              '   editable={ {{editable}} }\n' +
              '   error={ {{error}} }\n' +
              '   flaggable={ {{flaggable}} }\n' +
              '   flagIkon={ {{flagIkon}} }\n' +
              '   fullWidth={ {{fullWidth}} }\n' +
              '   itemsPerPage={ {{itemsPerPage}} }\n' +
              '   loading={ {{loading}} }\n' +
              '   pagination={ {{pagination}} }\n' +
              '   searchable={ {{searchable}} }\n' +
              '   selectable={ {{selectable}} }\n' +
              '   showSelectAll={ {{showSelectAll}} }\n' +
              '   sortable={ {{sortable}} }\n' +
              '   striped={ {{striped}} }\n' +
              '   summary={ {{summary}} }\n' +
              '   size=\'{{size}}\'\n' +
              '   subrowsIcon=\'{{subrowsIcon}}\'\n' +
              '/>', {
              allowNewRows: allowNewRows,
              animatable: animatable,
              categories: categories ? [{colSpan: 3, label: 'Category', border: true}] : undefined,
              coloredSelectedRow: coloredSelectedRow,
              columns: JSON.stringify(columns, null, 2),
              editable: editable,
              error: error ? 'This table has an error' : undefined,
              flaggable: flaggable,
              flagIkon: flagIkon,
              fullWidth: fullWidth,
              itemsPerPage: itemsPerPage,
              items: JSON.stringify(readyItems, null, 2),
              loading: loading,
              pagination: pagination,
              searchable: searchable,
              selectable: selectable,
              showSelectAll: showSelectAll,
              sortable: sortable,
              striped: striped,
              summary: summary,
              size: size,
              subrowsIcon: subrowsIcon
            })}
          </SyntaxHighlighter>
          <VerticalSeparatorDiv size='2'/>

          <Heading size="small">
            Component import
          </Heading>
          <VerticalSeparatorDiv size='2'/>
          <SyntaxHighlighter language='javascript' style={_highContrast ? dark : light}>
            {'import TableSorter from \'tabell\''}
          </SyntaxHighlighter>
          <VerticalSeparatorDiv size='2'/>

          <Heading size="small">
            React props
          </Heading>
          <VerticalSeparatorDiv size='2'/>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Property</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Required</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Default</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.DataCell>allowNewRows</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Allow new rows</Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>animatable</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Animate rows</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>beforeRowAdded</Table.DataCell>
                <Table.DataCell><code>(colums: Array&lt;Column&lt;CustomItem, CustomContext&gt;&gt;, context: CustomContext) =&gt; boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function before row is added</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>beforeRowEdited</Table.DataCell>
                <Table.DataCell><code>(item: CustomItem, context: CustomContext) =&gt; boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function before row is edited</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>categories</Table.DataCell>
                <Table.DataCell><code>string</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Additional classnames</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>className</Table.DataCell>
                <Table.DataCell><code>Array&lt;Category&gt;</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Adding a meta header table over table headers</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>coloredSelectedRows</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Have a select background color on selecgted rows</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>context</Table.DataCell>
                <Table.DataCell><code>object</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Optional context params to be passed when adding callback functions to cell elements</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>columns</Table.DataCell>
                <Table.DataCell><code>array</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>List with column data. Elements should be objects with keys <code>id</code>, <code>label</code>, <code>type</code></Table.DataCell>
                <Table.DataCell><code>[]</code></Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>editable</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Turn into a table where you can edit / add / remove rows</Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>flaggable</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Add optional flags for table rows</Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>flagIkon</Table.DataCell>
                <Table.DataCell><code>JSX.Element | string</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Customize the flag icon</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>fullWidth</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>full width table </Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>error</Table.DataCell>
                <Table.DataCell><code>string</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Add error message</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>initialPage</Table.DataCell>
                <Table.DataCell><code>number</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>If pagination is true, set the initial page to be seen (default is 1)</Table.DataCell>
                <Table.DataCell><code>1</code></Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>id</Table.DataCell>
                <Table.DataCell><code>string</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Optional ID value - default is a md5 generation</Table.DataCell>
                <Table.DataCell><code>md5('tabell-' + new Date().getTime())</code></Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>items</Table.DataCell>
                <Table.DataCell><code>array</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>List with row data. List elements should be objects where keys match a given column id.</Table.DataCell>
                <Table.DataCell><code>[]</code></Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>itemsPerPage</Table.DataCell>
                <Table.DataCell><code>number</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>If pagination is <code>true</code>, sets the number of items per page.</Table.DataCell>
                <Table.DataCell><code>10</code></Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>labels</Table.DataCell>
                <Table.DataCell><code>object</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Translation object with labels, if you want to override the default labels.</Table.DataCell>
                <Table.DataCell>{}</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>loading</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Loading spinner, useful for lazy data fetch.</Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>onColumnSort</Table.DataCell>
                <Table.DataCell><code>function</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function after sorting column is performed</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>onRowClicked</Table.DataCell>
                <Table.DataCell><code>function</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function when row is clicked</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>onRowDoubleClicked</Table.DataCell>
                <Table.DataCell><code>function</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function when row is double clicked</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>onRowsChanged</Table.DataCell>
                <Table.DataCell><code>function</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function when rows change</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>onRowSelectChange</Table.DataCell>
                <Table.DataCell><code>function</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Callback function when selection mode of at least one row changes. The table items are returned as param</Table.DataCell>
                <Table.DataCell>-</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>pagination</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Turns pagination on the table, to keep big tables in a manageable size.</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>searchable</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Adds a search icon that allows row search fields to show</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>selectable</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Renders a first column with checkboxes that trigger the <code>onRowSelectChange</code> callback function</Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>showSelectAll</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Show the checkbox for select all column</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>size</Table.DataCell>
                <Table.DataCell><code>'medium' | 'small'</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Table size</Table.DataCell>
                <Table.DataCell><code>medium</code></Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>sort</Table.DataCell>
                <Table.DataCell><code>object</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Initial sorting information.</Table.DataCell>
                <Table.DataCell>{'{'} column: '', order: '' {'}'}</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>sortable</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Allow sortable table headers</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>subrowsIcon</Table.DataCell>
                <Table.DataCell><code>'arrow' | 'merge'</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Icon to show on the button that expandsa subrows</Table.DataCell>
                <Table.DataCell>arrow</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>striped</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Use striped rows</Table.DataCell>
                <Table.DataCell>true</Table.DataCell>
              </Table.Row>
              <Table.Row>
                <Table.DataCell>summary</Table.DataCell>
                <Table.DataCell><code>boolean</code></Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
                <Table.DataCell>Displays a total selected elements and extended pagination info, if true</Table.DataCell>
                <Table.DataCell>false</Table.DataCell>
              </Table.Row>
            </Table.Body>
          </Table>
        </PaddedDiv>
      </NavHighContrast>
    </>
  )
}

export default Page
