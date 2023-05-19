import { useConfigService } from '../services/useConfigService';

export default function Index() {
  const { permitirVenda } = useConfigService();

  return <section className='flyer'>
      <img src="/assets/refugio.png" className='refugio' />
      <div className="title">
        <img src="/assets/sunset.png" />
      </div>
      <img src="/assets/infos.png" className='infos' />
    </section>;
}

export const getStaticProps = () => {
  return {
    props: {}
  }
}
