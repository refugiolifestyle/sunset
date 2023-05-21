import { get, ref, set } from 'firebase/database';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { useEffect, useState } from 'react';
import { firebaseDatabase } from '../../configs/firebase';
import { useRedesService } from '../../services/useRedesService';

const dataColumns = [
  'Rede',
  'Célula',
  'CPF',
  'Nome',
  'Telefone',
  'Pulseira'
];

export default function TableInscritos({ inscritos, loading, actions }) {
  const { redes, celulas } = useRedesService();
  const [visibleColumns, setVisibleColumns] = useState(dataColumns);
  const [countRealRows, setCountRealRows] = useState(0);
  const [retirandoPulseira, setRetirandoPulseira] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rede: { value: null, matchMode: FilterMatchMode.IN },
    celula: { value: null, matchMode: FilterMatchMode.IN },
    cpf: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pulseiraRetirada: { value: null, matchMode: FilterMatchMode.EQUALS }
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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const retirarPulseira = async dados => {
    try {
      let confirmaRetirada = confirm(`Confirma a retirada da pulseira de ${dados.nome}`);
      if (confirmaRetirada) {
        setRetirandoPulseira(true);

        let cpfPrepared = dados.cpf.replaceAll(/[.-]+/g, '');
        let refer = ref(firebaseDatabase, `inscricoes/${dados.rede}/${dados.celula}/${cpfPrepared}/pulseiraRetirada`)
        await set(refer, true);

        let pulseiraRetirada = await get(refer);
        if (!pulseiraRetirada.exists || !pulseiraRetirada.val()) {
          throw 'Falha ao Retirar a pulseira'
        }

        setRetirandoPulseira(false);
      }
    } catch (e) {
      setRetirandoPulseira(false);
      console.error(e)
      alert("Falha ao Retirar a pulseira! Tente novamente depois.")
    }
  }

  return <DataTable
    dataKey="cpf"
    value={inscritos}
    onValueChange={data => setCountRealRows(data?.length || 0)}
    emptyMessage='Nenhuma venda encontrada'
    loading={loading}
    compareSelectionBy='equals'
    header={<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type='search' value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pesquisar por..." />
        </span>
      </div>
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
    {visibleColumns.includes('Pulseira')
      ? <Column
        field="pulseiraRetirada"
        filter
        header="Pulseira"
        dataType="boolean"
        style={{ minWidth: '6rem' }}
        body={(rowData) => !rowData.pulseiraRetirada
          ? <Button onClick={() => retirarPulseira(rowData)} loading={retirandoPulseira} size='small' severity='success' icon="pi pi-check-circle" label={"Retirar pulseira"} />
          : <i className="pi pi-check-circle"></i>}
        filterElement={(options) => <div className="flex align-items-center gap-2">
          <TriStateCheckbox id="pulseira-retirada-filter" value={options.value} onChange={(e) => options.filterCallback(e.value)} />
          <label htmlFor="pulseira-retirada-filter" className="font-bold">
            Pulseira retirada
          </label>
        </div>
        }
      />
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