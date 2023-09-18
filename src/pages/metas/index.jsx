'use client'

import { get, ref, set } from 'firebase/database';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { MultiSelect } from 'primereact/multiselect';
import { useState } from 'react';
import { Page } from '../../components/page';
import { firebaseDatabase } from '../../configs/firebase';
import { useConfigService } from '../../services/useConfigService';
import { useInscritosService } from '../../services/useInscritosService';
import { useRedesService } from '../../services/useRedesService';

export default function Index() {
  const { redes, celulas } = useRedesService()
  const { inscritos, loading: loadingInscritos } = useInscritosService()
  const { evento, eventos, loading: loadingConfig } = useConfigService()
  const [confirmacaoEmAndamento, setConfirmacaoEmAndamento] = useState(false);
  const inscritosByRedeCelula = {}

  const confirmarMeta = async (dados) => {
    try {
      let confirmaBatimentoDaMeta = confirm(`Você confirma que a ${dados.celula} bateu a meta?`);
      if (confirmaBatimentoDaMeta) {
        setConfirmacaoEmAndamento(true);

        let refer = ref(firebaseDatabase, `configuracoes/eventos/${evento}/contemplados/${dados.celula}`)
        await set(refer, new Date().toLocaleString('pt-BR'));

        let saved = await get(refer);
        if (!saved.exists) {
          throw 'Falha ao confirmar! Dados não foram salvos.'
        }

        setConfirmacaoEmAndamento(false);
      }
    } catch (e) {
      console.error(e)
      setConfirmacaoEmAndamento(false)
      alert("Falha ao confirmar! Tente novamente depois.")
    }
  }

  if (inscritos.length) {
    inscritos.forEach(inscrito => {
      let chave = `${inscrito.rede}-${inscrito.celula}`;
      if (!inscritosByRedeCelula.hasOwnProperty(chave)) {
        inscritosByRedeCelula[chave] = {
          id: chave,
          rede: inscrito.rede,
          celula: inscrito.celula,
          inscricoes: 0,
          meta: false
        }
      }
      
      if (inscrito.eventos && inscrito.eventos[evento] && inscrito.eventos[evento].confirmada) {
        inscritosByRedeCelula[chave]['inscricoes'] += 1
        inscritosByRedeCelula[chave]['meta'] = inscritosByRedeCelula[chave]['inscricoes'] >= eventos[evento].meta
      }
    })
  }

  return <Page
    title="Metas">
    <DataTable
      dataKey="id"
      loading={loadingInscritos || loadingConfig}
      emptyMessage='Nenhum registro encontrado'
      compareSelectionBy='equals'
      value={Object.values(inscritosByRedeCelula)}
      sortOrder={1}
      removableSort
      sortMode="multiple"
      multiSortMeta={[{ field: 'rede', order: 1 }, { field: 'celula', order: 1 }]}
      paginator
      rows={15}
      rowsPerPageOptions={[5, 15, 30, 50, 100]}
      filters={{
        rede: { value: null, matchMode: FilterMatchMode.IN },
        celula: { value: null, matchMode: FilterMatchMode.IN },
      }}>
      <Column
        field="rede"
        filter
        filterField="rede"
        filterElement={options => <MultiSelect filter value={options.value} options={redes} onChange={(e) => options.filterCallback(e.value)} placeholder="Filtrar por Rede" className="p-column-filter" />}
        showFilterMatchModes={false}
        header="Rede"
        sortable />
      <Column
        field="celula"
        filter
        filterField="celula"
        filterElement={options => <MultiSelect filter value={options.value} options={celulas} onChange={(e) => options.filterCallback(e.value)} placeholder="Filtrar por Célula" className="p-column-filter" />}
        showFilterMatchModes={false}
        header="Célula"
        sortable />
      <Column
        field="inscricoes"
        header="Total de inscritos"
        sortable />
      <Column field="meta"
        header="Meta"
        body={data => data.meta
          ? eventos[evento].contemplados && eventos[evento].contemplados.hasOwnProperty(data.celula)
            ? 'Confirmada'
            : <Button onClick={() => confirmarMeta(data)} loading={confirmacaoEmAndamento} size='small' severity='success' icon="pi pi-check-circle" label={"Bateu a meta! Confirma?"} />
          : '-'
        }
        sortable />
    </DataTable>
  </Page>
}