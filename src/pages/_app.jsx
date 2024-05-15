import 'primeicons/primeicons.css';
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "tailwindcss/tailwind.css";
import "../configs/locale";
import "./index.css";

import PrimeReact from "primereact/api";
import Head from 'next/head';
PrimeReact.cssTransition = true;
PrimeReact.inputStyle = 'outlined';
PrimeReact.inputStyle = 'filled';

function MyApp({ Component, pageProps }) {
  return <>
    <Head>

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
    <div className="home">
      <Component {...pageProps} />
    </div>
  </>
}

export default MyApp
