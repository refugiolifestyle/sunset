import { useConfigService } from '../services/useConfigService';

export default function Index() {
  const { permitirVenda } = useConfigService();

  return <section className='flyer'>
    <div className="refugio">
      <img src="/assets/refugio.png" />
    </div>
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
