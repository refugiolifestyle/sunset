import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { MultiSelect } from 'primereact/multiselect';
import { useEffect, useState } from 'react';
import { useRedesService } from '../../services/useRedesService';

const dataColumns = [
  'Rede',
  'Célula',
  'CPF',
  'Nome',
  'Telefone'
];

export default function TableInscritos({ inscritos, loading, actions }) {
  const {redes, celulas} = useRedesService();
  const [visibleColumns, setVisibleColumns] = useState(dataColumns);
  const [countRealRows, setCountRealRows] = useState(0);
  const [filters, setFilter] = useState({
    rede: { value: null, matchMode: FilterMatchMode.IN },
    celula: { value: null, matchMode: FilterMatchMode.IN },
    cpf: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
  });

  useEffect(() => {
    setCountRealRows(inscritos.length)
  }, [inscritos])

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = dataColumns.filter((col) =>
      selectedColumns.some((sCol) => sCol === col));

    setVisibleColumns(orderedSelectedColumns);
  };

  return <DataTable
    value={inscritos}
    onValueChange={data => setCountRealRows(data?.length || 0)}
    emptyMessage='Nenhuma venda encontrada'
    loading={loading}
    header={<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
      <span>Total de vendas: {countRealRows} {countRealRows === 1 ? "venda" : "vendas"}</span>
      <MultiSelect
        value={visibleColumns}
        options={dataColumns}
        placeholder="Colunas visíveis"
        className="w-full max-w-xs"
        onChange={onColumnToggle}
        maxSelectedLabels={3}
        display="chip" />
    </div>}
    paginator
    rows={15}
    rowsPerPageOptions={[5, 15, 30, 50, 100]}
    multiSortMeta={[{ field: 'rede', order: 1 }, { field: 'celula', order: 1 }, { field: 'nome', order: 1 }]}
    sortOrder={1}
    sortMode="multiple"
    removableSort
    dataKey="nome"
    filters={filters}>
    {visibleColumns.includes('Rede')
      ? <Column
        field="rede"
        filter
        filterField="rede"
        filterElement={options => <MultiSelect filter value={options.value} options={redes} onChange={(e) => options.filterCallback(e.value)} placeholder="Filtrar por Rede" className="p-column-filter" />}
        showFilterMatchModes={false}
        header="Rede"
        sortable />
      : null}
    {visibleColumns.includes('Célula')
      ? <Column
        field="celula"
        filter
        filterField="celula"
        filterElement={options => <MultiSelect filter value={options.value} options={celulas} onChange={(e) => options.filterCallback(e.value)} placeholder="Filtrar por Célula" className="p-column-filter" />}
        showFilterMatchModes={false}
        header="Célula"
        sortable />
      : null}
    {visibleColumns.includes('Nome')
      ? <Column
        field="nome"
        filterField="nome"
        filter
        filterPlaceholder="Filtrar por Nome"
        header="Nome"
        sortable />
      : null}
      {visibleColumns.includes('CPF')
        ? <Column
          field="cpf"
          filterField="cpf"
          filter
          filterPlaceholder="Filtrar por CPF"
          header="CPF" />
        : null}
    {visibleColumns.includes('Telefone')
      ? <Column
        field="telefone"
        filterField="telefone"
        filter
        filterPlaceholder="Filtrar por Telefone"
        header="Telefone" />
      : null}
    {
      actions
        ? <Column
          header="#"
          body={actions} />
        : null
    }
  </DataTable>
}