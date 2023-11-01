import 'primeicons/primeicons.css';
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "tailwindcss/tailwind.css";
import "../configs/locale";
import "./index.css";

import Image from "next/image";

import PrimeReact from "primereact/api";
PrimeReact.cssTransition = true;
PrimeReact.inputStyle = 'outlined';
PrimeReact.inputStyle = 'filled';

function MyApp({ Component, pageProps }) {
  return <div className="home">
    <Component {...pageProps} />
  </div>
}

export default MyApp
