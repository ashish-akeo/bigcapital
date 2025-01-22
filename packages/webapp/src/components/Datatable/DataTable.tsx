

// @ts-nocheck
import React, { useEffect, useRef} from 'react';
import {
  useTable,
  useExpanded,
  useRowSelect,
  usePagination,
  useResizeColumns,
  useSortBy,
  useFlexLayout,
  useAsyncDebounce,
} from 'react-table';
import { useSticky } from 'react-table-sticky';
 
import { useUpdateEffect } from '@/hooks';
import { saveInvoke } from '@/utils';
 
import '@/style/components/DataTable/DataTable.scss';
 
import TableNoResultsRow from './TableNoResultsRow';
import TableLoadingRow from './TableLoading';
import TableHeader from './TableHeader';
import TablePage from './TablePage';
import TableFooter from './TableFooter';
import TableRow from './TableRow';
import TableRows from './TableRows';
import TableCell from './TableCell';
import TableTBody from './TableTBody';
import TableContext from './TableContext';
import TablePagination from './TablePagination';
import TableWrapper from './TableWrapper';
 
import TableIndeterminateCheckboxRow from './TableIndeterminateCheckboxRow';
import TableIndeterminateCheckboxHeader from './TableIndeterminateCheckboxHeader';
 
import { useResizeObserver } from './utils';
 
/**
 * Datatable component.
 */
export function DataTable(props) {
  const handleCheckboxClick = (rowData) => {
    if(props.setSelectedRows)
    {
      props.setSelectedRows((prevSelectedRows) => {
        const isSelected = prevSelectedRows.includes(rowData.id);
        const newSelectedRows = isSelected
          ? prevSelectedRows.filter((id) => id !== rowData.id)
          : [...prevSelectedRows, rowData.id];
          if (props.onSelectedRowsChange) {
              props.onSelectedRowsChange(newSelectedRows);
          } 
          return newSelectedRows;
       });
    }
  };
  const handleBulkCheckboxClick = (event,data) => {
    if(props.setSelectedRows)
    {
      if(!event.checked)
      {
        props.setSelectedRows([]); 
      } 
      else
      {
        const allRowIds = data.map(row => row.id);
        props.setSelectedRows(allRowIds); 
      }
    }
  };
  
  const {
    columns,
    data,
 
    onFetchData,
 
    onSelectedRowsChange,
    manualSortBy = false,
    manualPagination = true,
    selectionColumn = false,
    expandSubRows = true,
    expanded = {},
    rowClassNames,
    payload,
    expandable = false,
    noInitialFetch = false,
    pagesCount: controlledPageCount,
 
    // Pagination props.
    initialPageIndex = 0,
    initialPageSize = 20,

    // Hidden columns.
    initialHiddenColumns = [],
    setSelectedRows,
    updateDebounceTime = 200,
    selectionColumnWidth = 42,
 
    autoResetPage,
    autoResetExpanded,
    autoResetGroupBy,
    autoResetSelectedRows,
    autoResetSortBy,
    autoResetFilters,
    autoResetRowState,
 
    // Components
    TableHeaderRenderer,
    TablePageRenderer,
    TableWrapperRenderer,
    TableTBodyRenderer,
    TablePaginationRenderer,
    TableFooterRenderer,
 
    onColumnResizing,
    initialColumnsWidths,
    ...restProps
  } = props;
  const selectionColumnObj = {
    id: 'selection',
    disableResizing: true,
    minWidth: selectionColumnWidth,
    width: selectionColumnWidth,
    maxWidth: selectionColumnWidth,
    skeletonWidthMin: 100,
    Header: (props) => (
      <TableIndeterminateCheckboxHeader
        {...props}
        handleBulkCheckboxClick={handleBulkCheckboxClick}
      />
    ),
    Cell: ({ row }) => (
      <TableIndeterminateCheckboxRow
        row={row}
        onCheckboxClick={() => handleCheckboxClick(row.original)}
      />
    ),
    className: 'selection',
    ...(typeof selectionColumn === 'object' ? selectionColumn : {}),
  };
  
  const table = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: initialPageIndex,
        pageSize: initialPageSize,
        expanded,
        columnResizing: {
          columnWidths: initialColumnsWidths || {},
        },
        hiddenColumns: initialHiddenColumns,
      },
      manualPagination,
      pageCount: controlledPageCount,
      getSubRows: (row) => row.children,
      manualSortBy,
      expandSubRows,
      payload,
 
      autoResetPage,
      autoResetExpanded,
      autoResetGroupBy,
      autoResetSelectedRows,
      autoResetSortBy,
      autoResetFilters,
      autoResetRowState,
 
      ...restProps,
    },
    useSortBy,
    useExpanded,
    useResizeColumns,
    useFlexLayout,
    useSticky,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        ...(selectionColumn ? [selectionColumnObj] : []),
        ...columns,
      ]);
    },
  );
 
  const {
    selectedFlatRows,
    state: { pageIndex, pageSize, sortBy, selectedRowIds },
  } = table;
 
  const isInitialMount = useRef(noInitialFetch);
 
  const onFetchDataDebounced = useAsyncDebounce((...args) => {
    saveInvoke(onFetchData, ...args);
  }, updateDebounceTime);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      onFetchDataDebounced({ pageIndex, pageSize, sortBy });
    }
  }, [pageIndex, pageSize, sortBy, onFetchDataDebounced]);
 

  // Column resizing observer.
  useResizeObserver(table.state, (current, columnWidth, columnsResizing) => {
    onColumnResizing && onColumnResizing(current, columnWidth, columnsResizing);
  });
 
  return (
    <TableContext.Provider value={{ table, props }}>
      <TableWrapperRenderer>
        <TableHeaderRenderer />
 
        <TableTBodyRenderer>
          {' '}
          <TablePageRenderer />
        </TableTBodyRenderer>
 
        <TableFooterRenderer />
      </TableWrapperRenderer>
      <TablePaginationRenderer />
    </TableContext.Provider>
  );
}
 
DataTable.defaultProps = {
  pagination: false,
  hidePaginationNoPages: true,
  hideTableHeader: false,
 
  size: null,
  spinnerProps: { size: 30 },
 
  expandToggleColumn: 1,
  expandColumnSpace: 0.8,
 
  autoResetPage: true,
  autoResetExpanded: true,
  autoResetGroupBy: true,
  autoResetSelectedRows: true,
  autoResetSortBy: true,
  autoResetFilters: true,
  autoResetRowState: true,
 
  TableHeaderRenderer: TableHeader,
  TableFooterRenderer: TableFooter,
  TableLoadingRenderer: TableLoadingRow,
  TablePageRenderer: TablePage,
  TableRowsRenderer: TableRows,
  TableRowRenderer: TableRow,
  TableCellRenderer: TableCell,
  TableWrapperRenderer: TableWrapper,
  TableTBodyRenderer: TableTBody,
  TablePaginationRenderer: TablePagination,
  TableNoResultsRowRenderer: TableNoResultsRow,
 
  noResults: '',
  payload: {},
};
 