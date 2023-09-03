import { get, ref, update } from 'firebase/database';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import { firebaseDatabase } from '../../configs/firebase';
import { useRedesService } from '../../services/useRedesService';

const dataColumns = [
  'Rede',
  'Célula',
  'CPF',
  'Nome',
  'Telefone',
  'Summit Conference 2k23'
];

export default function TableInscritos({ inscritos, loading, actions }) {
  const { redes, celulas } = useRedesService();
  const [visibleColumns, setVisibleColumns] = useState(dataColumns);
  const [countRealRows, setCountRealRows] = useState(0);
  const [confirmacaoEmAndamento, setConfirmacaoEmAndamento] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rede: { value: null, matchMode: FilterMatchMode.IN },
    celula: { value: null, matchMode: FilterMatchMode.IN },
    cpf: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'eventos.summitconference.confirmada': { value: null, matchMode: FilterMatchMode.EQUALS }
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

  const confirmarEvento = async (evento, dados) => {
    try {
      let confirmaRetirada = confirm(`Você confirma ${dados.nome} para esse Evento?`);
      if (confirmaRetirada) {
        setConfirmacaoEmAndamento(true);

        let refer = ref(firebaseDatabase, `inscricoes/${dados.id}/eventos/${evento}`)
        await update(refer, {
          confirmada: true,
          confirmacao: new Date().toLocaleString('pt-BR')
        });

        let saved = await get(refer);
        if (!saved.exists) {
          throw 'Falha ao confirmar! Dados não foram salvos.'
        }
        else {
          let inscritosaved = saved.val();
          if (!inscritosaved.confirmada) {
            throw 'Falha ao confirmar! Confirmação não foi realizada.'
          }
        }

        setConfirmacaoEmAndamento(false);
      }
    } catch (e) {
      console.error(e)
      setConfirmacaoEmAndamento(false)
      alert("Falha ao confirmar! Tente novamente depois.")
    }
  }

  return <DataTable
    dataKey="id"
    value={inscritos}
    onValueChange={data => setCountRealRows(data?.length || 0)}
    emptyMessage='Nenhuma pessoa encontrada'
    loading={loading}
    compareSelectionBy='equals'
    header={<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type='search' value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pesquisar por..." />
        </span>
      </div>
      <span>Total de pessoas: {countRealRows} {countRealRows === 1 ? "pessoa" : " pessoas"}</span>
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
    {visibleColumns.includes('Summit Conference 2k23')
      ? <Column
        dataType="boolean"
        field="eventos.summitconference.confirmada"
        header="Summit Conference 2k23"
        style={{ minWidth: '6rem' }}
        filter
        filterElement={options => <>
        <Dropdown className='mr-2 p-column-filter' value={options.value} options={[
          {label: 'Pré-inscrições realizadas', value: false},
          {label: 'Inscrições confirmadas', value: true},
        ]} onChange={(e) => options.filterCallback(e.value)} placeholder="Todos" />
        </>}
        body={(rowData) => rowData.eventos && rowData.eventos.summitconference
          ? rowData.eventos.summitconference.confirmada
            ? 'Confirmada'
            : <Button onClick={() => confirmarEvento('summitconference', rowData)} loading={confirmacaoEmAndamento} size='small' severity='success' icon="pi pi-check-circle" label={"Confirmar presença"} />
          : '-'}
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