// import type { AppProps } from "next/app";
// import Layout from "../components/Layout";
// import { Poppins } from "next/font/google";
// import MenuStoreProvider from "../store/Menu";
// import UserStoreProvider from "../store/User";
// import axios from "axios";
// import SiteContextProvider from "../store/Site";
// import GamesStoreProvider from "../store/Games";
// import SportProvider from "../store/Sport";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import "react-toastify/dist/ReactToastify.css";
// import "animate.css/animate.min.css";
// import "../styles/style.scss"; // Import stylesheet
// import Head from "next/head";

// const poppins = Poppins({
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   variable: "--font-poppins",
//   // style: ["normal"],
//   subsets: ["latin"],
//   display: "swap",
// });

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <>
//       <Head>
//         <meta name='theme-color' content='#235789' />
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
//       </Head>
//       <SiteContextProvider>
//         <GamesStoreProvider>
//           <MenuStoreProvider>
//             <UserStoreProvider>
//               <SportProvider>
//                 <main className={`${poppins.variable} font-sans`}>
//                   <Layout>
//                     <Component {...pageProps} />
//                   </Layout>
//                 </main>
//               </SportProvider>
//             </UserStoreProvider>
//           </MenuStoreProvider>
//         </GamesStoreProvider>
//       </SiteContextProvider>
//     </>
//   );
// }
import { useEffect } from "react";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { Poppins } from "next/font/google";
import MenuStoreProvider from "../store/Menu";
import UserStoreProvider from "../store/User";
import axios from "axios";
import SiteContextProvider from "../store/Site";
import GamesStoreProvider from "../store/Games";
import SportProvider from "../store/Sport";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-toastify/dist/ReactToastify.css";
import "animate.css/animate.min.css";
import "../styles/style.scss";
import Head from "next/head";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["x-access-token"] = token;
    }
  }, []);

  return (
    <>
      <Head>
        <meta name='theme-color' content='#235789' />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </Head>
      <SiteContextProvider>
        <GamesStoreProvider>
          <MenuStoreProvider>
            <UserStoreProvider>
              <SportProvider>
                <main className={`${poppins.variable} font-sans`}>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </main>
              </SportProvider>
            </UserStoreProvider>
          </MenuStoreProvider>
        </GamesStoreProvider>
      </SiteContextProvider>
    </>
  );
}
