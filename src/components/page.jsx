import Head from 'next/head';
import { HeaderNavigation } from './header';

export const Page = ({ title, children }) => {
  return <>
    <Head>
      <title>{title} :: Refúgio Lifestyle</title>
    </Head>
    <section className='w-full'>
      <HeaderNavigation current={title} />
      <main className="max-w-7xl bg-white rounded-lg shadow-2xl p-6 my-6 mx-6 xl:mx-auto">
        {children}
      </main>
    </section>
  </>;
}