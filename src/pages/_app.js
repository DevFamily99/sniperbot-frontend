import { useEffect } from 'react'
import Head from 'next/head';
import socketIOClient from "socket.io-client";
import { CacheProvider } from '@emotion/react';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify'
import { createEmotionCache } from '../utils/create-emotion-cache';
import { theme } from '../theme';
import 'react-toastify/dist/ReactToastify.css';
import '../theme/custom.css'

const clientSideEmotionCache = createEmotionCache();
import { SERVER } from "../utils/config";

const App = (props) => {
  const TokenInfo = ({ name, hash, route, fnName }) => (
    <div>
      <h4>{route}: {fnName}</h4>
      <p>Contract: {name}</p>
      <p>TX: {hash}</p>
    </div>
  )
  useEffect(() => {
    const socket = socketIOClient(SERVER)
    socket.on('connect', () => {
      console.log(`I'm connected with the back-end`)
      socket.on('pancake:one:newTokenDetected', (data) => {
        console.log('pancakeswap token detected')
        const { name, hash } = data

        toast.info(<TokenInfo name={name}
          route={"PancakeSwap"}
          hash={hash} />, {
          position: 'bottom-left',
          theme: 'colored',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          pauseOnFocusLoss: false
        })
      })
      socket.on('uniswap:one:detectAddLiquidity', (data) => {
        console.log('uniswap token detected')
        const { name, hash, fnName } = data

        toast.info(
          <TokenInfo name={name}
            route={"UniSwap"}
            hash={hash}
            fnName={fnName}
          />, {
          position: 'bottom-left',
          theme: 'colored',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          pauseOnFocusLoss: false
        })
      })
    })
  }, [])

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>
          Material Kit Pro
        </title>
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width"
        />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ToastContainer
          position="bottom-left"
          theme="colored"
          autoClose={5000}
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover
          className="fit-content"
        />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
        </ThemeProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
};

export default App;
