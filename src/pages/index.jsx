import { child, push, ref, set } from 'firebase/database';
import Head from 'next/head';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputMask } from 'primereact/inputmask';
import { Checkbox } from 'primereact/checkbox';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { firebaseDatabase } from "../configs/firebase";
import { useConfigService } from '../services/useConfigService';
import { useRedesService } from '../services/useRedesService';
import { useInscritoService } from '../services/useInscritoService';
import { useParse } from '../hooks/useParse';
import { classNames } from 'primereact/utils';

export const metadata = {
  title: 'Festa da Colheita 2023 :: Refúgio Lifestyle',
  description: 'Festa da Colheita 2023',
  keywords: ['Refúgio', 'Festa da colheita', 'Evento', '2023']
};

export default function Index() {
  const [stepForm, setStepForm] = useState(1);
  const { redes, celulas, setRedeRef } = useRedesService()
  const { search, inscrito, loading } = useInscritoService()
  const { permitirVenda } = useConfigService()
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const { parseInscrito } = useParse();

  const salvarDados = async dados => {
    try {
      setStepForm(2);

      if (inscrito) {
        let refer = ref(firebaseDatabase, `inscricoes/${inscrito.id}`)
        await set(refer, {
          ...inscrito,
          eventos: {
            ...inscrito.eventos,
            festadacolheita2023: {
              preInscricao: new Date().toLocaleString('pt-BR'),
              confirmada: false
            }
          }
        })
      }
      else {
        let refer = ref(firebaseDatabase, `inscricoes`)

        Object.keys(dados).forEach(key => {
          if (dados[key] === undefined) {
            delete dados[key];
          }
        });

        if(dados.naoTenhoCelula) {
          dados.celula = 'Sem célula';
          dados.rede = 'Sem rede';
        }

        await push(refer, {
          ...parseInscrito(dados),
          eventos: {
            festadacolheita2023: {
              preInscricao: new Date().toLocaleString('pt-BR'),
              confirmada: false
            }
          }
        })
      }

      setStepForm(3);
      reset()
    } catch (e) {
      setStepForm(1);
      console.error(e)
      alert("Falha ao realizar a Pré-inscrição! Tente novamente depois.")
    }
  }

  useEffect(() => {
    let cpf = watch('cpf');
    if (/\d{3}.\d{3}.\d{3}-\d{2}/.test(cpf)) {
      search(cpf)
    }
  }, [watch('cpf')])

  useEffect(() => {
    let redeWatch = watch('rede');
    if (redeWatch) {
      redeWatch = new String(redeWatch)
        .replaceAll(/[^\d]+/g, '')

        setRedeRef(redeWatch)
    } else {
      setRedeRef(null);
    }
  }, [watch('rede')])

  const dadosInvalidos = dados => {
    if (dados.nome.type == 'validate') {
      alert("Digite seu Nome completo")
    } else {
      alert("Campos inválidos")
    }
  }

  return <>
    <Head>
      <title>{metadata.title}</title>
    </Head>
    <main className='flex flex-col lg:flex-row justify-evently gap-12'>
      <section className='flyer'>
        <div className="infos">
          <img src="/assets/infos.png" />
        </div>
      </section>
      {
        permitirVenda === true
          ?
          <section className="formulario">
            <form id="msform" onSubmit={handleSubmit(salvarDados, dadosInvalidos)}>
              <ul id="progressbar">
                <li className={stepForm >= 1 ? "active" : null}>Formulário</li>
                <li className={stepForm >= 2 ? "active" : null}>Salvando</li>
                <li className={stepForm >= 3 ? "active" : null}>A espera acabou!</li>
              </ul>
              {
                stepForm === 1
                  ? <fieldset>
                    <h2 className="fs-title">Realize sua Pré-inscrição</h2>
                    <h3 className="fs-subtitle">* Dados obrigatórios</h3>
                    <InputMask {...register(`cpf`, { required: true })} placeholder="CPF *" mask="999.999.999-99" autoFocus />
                    {
                      /\d{3}.\d{3}.\d{3}-\d{2}/.test(watch('cpf'))
                        ? loading
                          ? <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                          : inscrito
                            ? <>
                              <p className="boasvindas">Olá <b>{inscrito.nome}</b>, estamos certos que foi um ano de colheita e só foi melhor porque tivemos você caminhando conosco. Chegou a hora de celebrar as vitórias e aprendizados desse ano com muita alegria e comunhão. Vamos juntos para a <b>FESTA DA COLHEITA 2023!</b></p>
                              <p className="boasvindas">Clique abaixo e garanta sua pré-inscrição para viver essa noite incrível na presença de Deus.</p>
                            </>
                            : <>
                              <input {...register(`nome`, { required: true, validate: value => value.split(' ').length >= 2 })} placeholder="Nome Completo *" />
                              <InputMask {...register(`telefone`, { required: true })} placeholder="Telefone *" mask="(99) 99999-9999" />
                              { !watch('naoTenhoCelula') && <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Rede ${!watch('naoTenhoCelula') ? '*' : ''}`} value={watch('rede')} {...register('rede', { required: !watch('naoTenhoCelula') })} options={redes} /> }
                              { !watch('naoTenhoCelula') && <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Célula ${!watch('naoTenhoCelula') ? '*' : ''}`} value={watch('celula')} {...register('celula', { required: !watch('naoTenhoCelula') })} options={celulas} /> }
                              <div className="field-checkbox flex items-end justify-start gap-2">
                                <Controller name="naoTenhoCelula" control={control} render={({ field, fieldState }) => (
                                  <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                )} />
                                <label htmlFor="accept" className={classNames({ 'p-error': errors.accept })}>Não frequento uma Célula</label>
                              </div>
                            </>
                        : <></>
                    }
                    {
                      /\d{3}.\d{3}.\d{3}-\d{2}/.test(watch('cpf')) && !loading
                        ? <input type="submit" name="next" className="next action-button" value="Finalizar e #Partiu!" />
                        : null
                    }
                  </fieldset>
                  : null
              }
              {
                stepForm === 2
                  ? <fieldset>
                    <h2 className="fs-title">Aguarde</h2>
                    <h3 className="fs-subtitle">Estamos confirmando sua presença no melhor evento do ano</h3>
                    <i className="pi pi-spin pi-spinner text-yellow-600 text-5xl"></i>
                  </fieldset>
                  : null
              }
              {
                stepForm === 3
                  ? <fieldset>
                    <h2 className="fs-title">Pré-inscrição Confirmada</h2>
                    <h3 className="fs-subtitle">Fique atento ao dia do Pagamento e Retirada das pulseiras!</h3>
                    <img src="/assets/success.gif" />
                  </fieldset>
                  : null
              }
            </form>
          </section>
          : null
      }
    </main>
  </>;
}

export const getStaticProps = () => {
  return {
    props: {}
  }
}
