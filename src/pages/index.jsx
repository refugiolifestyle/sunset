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
import { cpf } from 'cpf-cnpj-validator'

export default function Index() {
  const [stepForm, setStepForm] = useState(1);
  const { redes, celulas, setRedeRef, } = useRedesService()
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
        let novoInscrito = {
          id: inscrito.id,
          cpf: inscrito.cpf,
          nome: inscrito.nome,
          telefone: inscrito.telefone,
          eventos: {
            ...inscrito.eventos,
            [evento]: {
              preInscricao: new Date().toLocaleString('pt-BR'),
              confirmada: false
            }
          }
        }

        if (dados.naoTenhoCelula) {
          novoInscrito.celula = 'Sem célula';
          novoInscrito.rede = 'Sem rede';
          novoInscrito.naoTenhoCelula = true;
          novoInscrito.denominacao = dados.denominacao;
        } else {
          novoInscrito.celula = dados.celula;
          novoInscrito.rede = dados.rede;
        }

        await set(refer, novoInscrito)
      }
      else {
        Object.keys(dados).forEach(key => {
          if (dados[key] === undefined) {
            delete dados[key];
          }
        });

        if (dados.naoTenhoCelula) {
          dados.celula = 'Sem célula';
          dados.rede = 'Sem rede';
        }

        let cpfNumb = dados.cpf.replaceAll('-', '').replaceAll('.', '')
        let refer = ref(firebaseDatabase, `inscricoes/${cpfNumb}`)
        await set(refer, {
          ...parseInscrito(dados),
          id: cpfNumb,
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
    let cpfNumber = watch('cpf');
    if (/\d{3}.\d{3}.\d{3}-\d{2}/.test(cpfNumber) && cpf.isValid(cpfNumber)) {
      search(cpfNumber)
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
    if (dados?.nome?.type == 'validate') {
      alert("Digite seu Nome completo")
    } else {
      alert("Campos inválidos")
    }
  }

  return <>
    <Head>
      <title>{metadata.title}</title>
      <meta name="description" content="Nosso 14º aniversário está chegando e para comemorar vem aí o SUNSET 2024" />
      <meta name="keywords" content="Refúgio,Lifestyle,Sunset 2024" />
      <meta property="og:title" content="Sunset 2024 :: Refúgio Lifestyle" />
      <meta property="og:description" content="Nosso 14º aniversário está chegando e para comemorar vem aí o SUNSET 2024" />
      <meta property="og:url" content="https://arefugio.com.br" />
      <meta property="og:site_name" content="Sunset 2024 :: Refúgio Lifestyle" />
      <meta property="og:locale" content="pt-BR" />
      <meta property="og:image:url" content="https://arefugio.com.br/assets/images/logo-302x44.png" />
      <meta property="og:image:width" content="302" />
      <meta property="og:image:height" content="44" />
      <meta property="og:type" content="website" />
      <meta name="robots" content="noindex, follow, nocache" />
      <meta name="color-scheme" content="light" />
      <meta name="author" content="Refúgio Lifestyle" />
      <link rel="author" href="https://arefugio.com.br" />
      <link rel="icon" href="https://arefugio.com.br/assets/images/favicon-dark.png" media="(prefers-color-scheme: light)" />
      <link rel="icon" href="https://arefugio.com.br/assets/images/favicon-light.png" media="(prefers-color-scheme: dark)" />
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
                    <InputMask {...register(`cpf`, { required: true })} placeholder="CPF *" mask="999.999.999-99" />
                    {
                      /\d{3}.\d{3}.\d{3}-\d{2}/.test(watch('cpf')) && cpf.isValid(watch('cpf'))
                        ? loading
                          ? <ProgressSpinner style={{ width: '50px', height: '50px', marginTop: '10px' }} />
                          : inscrito
                            ? inscrito.eventos && inscrito.eventos[evento]
                              ? <>
                                <p className="boasvindas">Olá, <b>{inscrito.nome}</b>, estamos muito felizes de te ver novamente em mais um evento nosso.</p>
                                {
                                  inscrito.eventos[evento].confirmada
                                    ? <p className="boasvindas"><b>Sua inscrição já foi confirmada.</b></p>
                                    : <>
                                      <p className="boasvindas"><b>Aguarde a confirmação da sua inscrição</b>, fique atento(a) ao dia do pagamento e retirada das pulseiras.</p>
                                    </>
                                }
                              </>
                              : <>
                                <p className="boasvindas">Olá, <b>{inscrito.nome}</b>, estamos muito felizes de te ver novamente em mais um evento nosso.</p>
                                <p className="boasvindas">Confirme os dados abaixo para garantir sua vaga.</p>
                                {!watch('naoTenhoCelula') && <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Rede ${!watch('naoTenhoCelula') ? '*' : ''}`} value={watch('rede')} {...register('rede', { required: !watch('naoTenhoCelula') })} options={redes} />}
                                {!watch('naoTenhoCelula') && <Dropdown className='w-full mb-3 rounded-none' placeholder={`Selecione sua Célula ${!watch('naoTenhoCelula') ? '*' : ''}`} value={watch('celula')} {...register('celula', { required: !watch('naoTenhoCelula') })} options={celulas} />}
                                <div className="field-checkbox flex items-end justify-start gap-2">
                                  <Controller name="naoTenhoCelula" control={control} render={({ field, fieldState }) => (
                                    <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                  )} />
                                  <label htmlFor="naoTenhoCelula" className={classNames({ 'p-error': errors.naoTenhoCelula })}>Convidado/Não frequenta uma célula</label>
                                </div>
                                {
                                  watch('naoTenhoCelula') && <input {...register(`denominacao`)} placeholder="Convidado? se sim qual denominação?" className='mt-3' />
                                }
                                {
                                  /\d{3}.\d{3}.\d{3}-\d{2}/.test(watch('cpf')) && cpf.isValid(watch('cpf')) && !loading
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
                                <label htmlFor="naoTenhoCelula" className={classNames({ 'p-error': errors.naoTenhoCelula })}>Convidado/Não frequenta uma célula</label>
                              </div>
                              {
                                watch('naoTenhoCelula') && <input {...register(`denominacao`)} placeholder="Convidado? se sim qual denominação?" className='mt-3' />
                              }
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