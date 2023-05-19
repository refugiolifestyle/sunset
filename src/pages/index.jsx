import { useConfigService } from '../services/useConfigService';

export default function Index() {
  const { permitirVenda } = useConfigService();

  return <section className='flyer'>
    <header>
      <img src="/assets/refugio.png" className='refugio' />
      <div className="title">
        <img src="/assets/sunset.png" />
      </div>
    </header>
    <div className="infos">
    <img src="/assets/infos.png" />
    </div>
  </section>;
}

export const getStaticProps = () => {
  return {
    props: {}
  }
}
