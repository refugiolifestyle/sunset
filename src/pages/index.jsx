import { get, ref, set } from 'firebase/database';
import Head from 'next/head';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { firebaseDatabase } from "../configs/firebase";
import { useConfigService } from '../services/useConfigService';
import { useRedesService } from '../services/useRedesService';

export const metadata = {
  title: 'Sunset :: Refúgio Lifestyle',
  description: 'Evento em comemoração aos 13 anos da Refúgio',
  keywords: ['Refúgio', 'Sunset', 'Evento']
};

export default function Index() {
  const [stepForm, setStepForm] = useState(1);
  const { redes, celulas } = useRedesService()
  const { permitirVenda } = useConfigService()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const salvarDados = async dados => {
    try {
      setStepForm(2);

      let cpfPrepared = dados.cpf.replaceAll(/[.-]+/g, '');
      let refer = ref(firebaseDatabase, `inscricoes/${dados.rede}/${dados.celula}/${cpfPrepared}`)
      await set(refer, {
        ...dados,
        data: new Date().toLocaleString('pt-BR')
      });

      let venda = await get(refer);
      if (venda.exists) {
        setStepForm(3);
        reset()
      } else {
        throw 'Falha ao salvar os dados'
      }
    } catch (e) {
      setStepForm(1);
      console.error(e)
      alert("Falha ao realizar a Pré-inscrição! Tente novamente depois.")
    }
  }

  const dadosInvalidos = dados => {
    if (dados.nome.type == 'validate') {
      alert("Digite seu Nome completo")
    } else {
      alert("Campos inválidos")
    }
  }

  return <>
    <Head>
      <title>Sunset :: Refúgio Lifestyle</title>
    </Head>
    <main className='flex flex-col lg:flex-row justify-evenly gap-6'>
      <section className='flyer'>
        <div className="refugio">
          <img src="/assets/refugio.png" />
        </div>
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
                    <Dropdown className='w-full mb-3 rounded-none' placeholder='Selecione sua Rede *' value={watch('rede')} {...register('rede', { required: true })} options={redes} />
                    <Dropdown className='w-full mb-3 rounded-none' placeholder='Selecione sua Célula *' value={watch('celula')} {...register('celula', { required: true })} options={celulas} />
                    <input {...register(`nome`, { required: true, validate: value => value.split(' ').length >= 2 })} placeholder="Nome Completo *" />
                    <InputMask {...register(`cpf`, { required: true })} placeholder="CPF *" mask="999.999.999-99" />
                    <InputMask {...register(`telefone`, { required: true })} placeholder="Telefone *" mask="(99) 99999-9999" />
                    <input type="submit" name="next" className="next action-button" value="Finalizar e #Partiu!" />
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
