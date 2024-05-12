import { child, push, ref, set } from 'firebase/database';
import Head from 'next/head';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputMask } from 'primereact/inputmask';
import { Checkbox } from 'primereact/checkbox';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { firebaseDatabase } from "../configs/firebase";
import { useConfigService } from '../services/useConfigService';
import { useRedesService } from '../services/useRedesService';
import { useInscritoService } from '../services/useInscritoService';
import { useParse } from '../hooks/useParse';
import { classNames } from 'primereact/utils';

export const metadata = {
  title: 'Sunset 2024 :: Refúgio Lifestyle',
  description: 'Sunset 2024',
  keywords: ['Refúgio', 'Sunset', 'Evento', '2024']
};

export default function Index() {
  const [stepForm, setStepForm] = useState(1);
  const { redes, celulas, setRedeRef,  } = useRedesService()
  const { search, inscrito, loading } = useInscritoService()
  const { permitirVenda, evento, loading: loadingConfig } = useConfigService()
  const { register, setValue, getValues, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    values: inscrito
  });
  const { parseInscrito } = useParse();

  const salvarDados = async dados => {
    try {
      setStepForm(2);

      if (inscrito) {
        let refer = ref(firebaseDatabase, `inscricoes/${inscrito.id}`)
        await set(refer, {
          ...dados,
          eventos: {
            ...inscrito.eventos,
            [evento]: {
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

        if (dados.naoTenhoCelula) {
          dados.celula = 'Sem célula';
          dados.rede = 'Sem rede';
        }

        await push(refer, {
          ...parseInscrito(dados),
          eventos: {
            [evento]: {
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
    console.log(dados, getValues(), inscrito)
    if (dados?.nome?.type == 'validate') {
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
        {loadingConfig && <ProgressSpinner style={{ width: '50px', height: '50px', marginTop: '10px' }} />}
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
                          ? <ProgressSpinner style={{ width: '50px', height: '50px', marginTop: '10px' }} />
                          : inscrito
                            ? inscrito.eventos && inscrito.eventos[evento]
                              ? <>
                                <p className="boasvindas">Olá, <b>{inscrito.nome}</b>, estamos muito felizes de te ver novamente em mais um evento nosso.</p>
                                {
                                  inscrito.eventos[evento].confirmada
                                    ? <p className="boasvindas"><b>Sua vaga já foi confirmada.</b></p>
                                    : <>
                                    <p className="boasvindas"><b>Aguardando a confirmação da inscrição</b>, fique atento ao dia do pagamento e retirada das pulseiras.</p>
                                    </>
                                }
                              </>
                              : <>
                                <p className="boasvindas">Olá, <b>{inscrito.nome}</b>, estamos muito felizes de te ver novamente em mais um evento nosso.</p>
                                <p className="boasvindas">Confirme os dados abaixo para garantir sua vaga.</p>
                                <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Rede *`} value={watch('rede')} {...register('rede', { required: true })} options={redes} />
                                <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Célula *`} value={watch('celula')} {...register('celula', { required: true })} options={celulas} />
                                {
                                  /\d{3}.\d{3}.\d{3}-\d{2}/.test(watch('cpf')) && !loading
                                    ? <input type="submit" name="next" className="next action-button" value="Finalizar e #Partiu!" />
                                    : null
                                }
                              </>
                            : <>
                              <input {...register(`nome`, { required: true, validate: value => new String(value).split(' ').length >= 2 })} placeholder="Nome Completo *" />
                              <InputMask {...register(`telefone`, { required: true })} placeholder="Telefone *" mask="(99) 99999-9999" />
                              {!watch('naoTenhoCelula') && <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Rede ${!watch('naoTenhoCelula') ? '*' : ''}`} value={watch('rede')} {...register('rede', { required: !watch('naoTenhoCelula') })} options={redes} />}
                              {!watch('naoTenhoCelula') && <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Célula ${!watch('naoTenhoCelula') ? '*' : ''}`} value={watch('celula')} {...register('celula', { required: !watch('naoTenhoCelula') })} options={celulas} />}
                              <div className="field-checkbox flex items-end justify-start gap-2">
                                <Controller name="naoTenhoCelula" control={control} render={({ field, fieldState }) => (
                                  <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                )} />
                                <label htmlFor="naoTenhoCelula" className={classNames({ 'p-error': errors.naoTenhoCelula })}>Não frequento uma Célula</label>
                              </div>
                              {
                                /\d{3}.\d{3}.\d{3}-\d{2}/.test(watch('cpf')) && !loading
                                  ? <input type="submit" name="next" className="next action-button" value="Finalizar e #Partiu!" />
                                  : null
                              }
                            </>
                        : <></>
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
