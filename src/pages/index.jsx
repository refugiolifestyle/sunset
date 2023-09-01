import { child, push, ref, set } from 'firebase/database';
import Head from 'next/head';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputMask } from 'primereact/inputmask';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { firebaseDatabase } from "../configs/firebase";
import { useConfigService } from '../services/useConfigService';
import { useRedesService } from '../services/useRedesService';
import { useInscritoService } from '../services/useInscritoService';
import { useParse } from '../hooks/useParse';

export const metadata = {
  title: 'Summit Conference 2k23 :: Refúgio Lifestyle',
  description: 'Conferência Refúgio 2023',
  keywords: ['Refúgio', 'Summit', 'Evento', 'Conferência',]
};

export default function Index() {
  const [stepForm, setStepForm] = useState(1);
  const { redes, celulas } = useRedesService()
  const { search, inscrito, loading } = useInscritoService()
  const { permitirVenda } = useConfigService()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
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
            summitconference: {
              preInscricao: new Date().toLocaleString('pt-BR'),
              confirmada: false
            }
          }
        })
      }
      else {
        let refer = ref(firebaseDatabase, `inscricoes`)
        await push(refer, {
          ...parseInscrito(dados),
          eventos: {
            summitconference: {
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
    <main className='flex flex-col lg:flex-row justify-evenly gap-6'>
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
                              <p className="boasvindas">Olá <b>{inscrito.nome}</b>, que bom ver que o tempo passou e você permanece em seu <b>REFÚGIO!</b> Estamos certos de que você já viveu experiências incríveis com Jesus junto conosco e em nossa <b>Conferência 2023</b> não será diferente.</p>
                              <p className="boasvindas">Clique abaixo e garanta sua pré-inscrição para viver esse mover.</p>
                            </>
                            : <>
                              <input {...register(`nome`, { required: true, validate: value => value.split(' ').length >= 2 })} placeholder="Nome Completo *" />
                              <InputMask {...register(`telefone`, { required: true })} placeholder="Telefone *" mask="(99) 99999-9999" />
                              <Dropdown className='w-full mb-3 rounded-none' placeholder='Selecione sua Rede *' value={watch('rede')} {...register('rede', { required: true })} options={redes} />
                              <Dropdown className='w-full mb-3 rounded-none' placeholder='Selecione sua Célula' value={watch('celula')} {...register('celula')} options={celulas} />
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
