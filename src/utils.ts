import { ColumnDef, TableHelper } from '@tanstack/react-table';
import { MRT_ColumnInstance, MRT_ColumnInterface } from '.';

export const findLowestLevelCols = (
  columns: MRT_ColumnInterface[] | MRT_ColumnInstance[],
) => {
  let lowestLevelColumns: MRT_ColumnInterface[] | MRT_ColumnInstance[] =
    columns;
  let currentCols: MRT_ColumnInterface[] | MRT_ColumnInstance[] | undefined =
    columns;
  while (!!currentCols?.length && currentCols.some((col) => col.columns)) {
    const nextCols: MRT_ColumnInterface[] = currentCols
      .filter((col) => !!col.columns)
      .map((col) => col.columns)
      .flat() as MRT_ColumnInterface[];
    if (nextCols.every((col) => !col?.columns)) {
      lowestLevelColumns = [...lowestLevelColumns, ...nextCols];
    }
    currentCols = nextCols;
  }
  return lowestLevelColumns.filter((col) => !col.columns);
};

export const createGroup = <D extends {} = {}>(
  table: TableHelper<D, unknown, unknown, unknown, unknown>,
  column: MRT_ColumnInterface<D>,
): ColumnDef<D, unknown, unknown, unknown, unknown> =>
  table.createGroup({
    ...column,
    columns: column?.columns?.map?.((col: MRT_ColumnInterface<D>) =>
      col.columns ? createGroup(table, col) : createColumn(table, col),
    ),
  } as any);

export const createColumn = <D extends {} = {}>(
  table: TableHelper<D, unknown, unknown, unknown, unknown>,
  column: MRT_ColumnInterface<D>,
): ColumnDef<D, unknown, unknown, unknown, unknown> =>
  column.columnType === 'display'
    ? table.createDisplayColumn(column as any)
    : table.createDataColumn(
        column.accessorFn ?? (column.id as keyof D),
        column as any,
      );
