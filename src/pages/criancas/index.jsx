import Head from 'next/head';
import { Dropdown } from 'primereact/dropdown';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useInscritosService } from '../../services/useInscritosService';

export const metadata = {
  title: 'Sunset :: Refúgio Lifestyle',
  description: 'Evento em comemoração aos 13 anos da Refúgio',
  keywords: ['Refúgio', 'Sunset', 'Evento']
};

export default function Index() {
  const [stepForm, setStepForm] = useState(1);
  const { inscritos, loading } = useInscritosService();
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm();
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: "criancas",
    rules: {
      required: true, 
      minLength: 1
    }
  });

  const salvarDados = async dados => {
    console.log(dados)
    // try {
    //   setStepForm(2);

    //   let cpfPrepared = dados.cpf.replaceAll(/[.-]+/g, '');
    //   let refer = ref(firebaseDatabase, `inscricoes/${dados.rede}/${dados.celula}/${cpfPrepared}`)
    //   await set(refer, {
    //     ...dados,
    //     data: new Date().toLocaleString('pt-BR')
    //   });

    //   let venda = await get(refer);
    //   if (venda.exists) {
    //     setStepForm(3);
    //     reset()
    //   } else {
    //     throw 'Falha ao salvar os dados'
    //   }
    // } catch (e) {
    //   setStepForm(1);
    //   console.error(e)
    //   alert("Falha ao realizar a Pré-inscrição! Tente novamente depois.")
    // }
  }

  const dadosInvalidos = dados => {
    if (dados.nome.type == 'validate') {
      alert("Digite seu Nome completo")
    } else {
      alert("Campos inválidos")
    }
  }

  inscritos
    .sort((a, b) => a.nome.localeCompare(b.nome))

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
      <section className="formulario">
        <form id="msform" onSubmit={handleSubmit(salvarDados, dadosInvalidos)}>
          <ul id="progressbar">
            <li className={stepForm >= 1 ? "active" : null}>Formulário</li>
            <li className={stepForm >= 2 ? "active" : null}>Salvando</li>
            <li className={stepForm >= 3 ? "active" : null}>Tudo certo!</li>
          </ul>
          {
            stepForm === 1
              ? <fieldset>
                <h2 className="fs-title">Informe suas Crianças que irão ao evento</h2>
                <h3 className="fs-subtitle">* Dados obrigatórios</h3>
                <Dropdown className='w-full mb-3 rounded-none' placeholder='Selecione o responsável *' value={watch('responsavel')} {...register('responsavel', { required: true })} options={inscritos} optionLabel='nome' optionValue='cpf' filter />
              
                <input type="button" name="next" className="next link-button" value="Adicionar uma criança" />
                <input type="submit" name="next" className="next action-button" value="Finalizar e #Partiu!" />
              </fieldset>
              : null
          }
          {
            stepForm === 2
              ? <fieldset>
                <h2 className="fs-title">Aguarde</h2>
                <h3 className="fs-subtitle">Estamos confirmando a presença de suas crianças no melhor evento do ano</h3>
                <i className="pi pi-spin pi-spinner text-yellow-600 text-5xl"></i>
              </fieldset>
              : null
          }
          {
            stepForm === 3
              ? <fieldset>
                <h2 className="fs-title">Pré-inscrição Confirmada</h2>
                <h3 className="fs-subtitle">Fique atento ao dia do evento, leve a documentação de suas crianças.!</h3>
                <img src="/assets/success.gif" />
              </fieldset>
              : null
          }
        </form>
      </section>
    </main>
  </>;
}

export const getStaticProps = () => {
  return {
    props: {}
  }
}
