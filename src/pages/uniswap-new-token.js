import { useState, useEffect } from 'react'
import socketIOClient from "socket.io-client"
import Head from 'next/head'
import { toast } from 'react-toastify'
import { Box, Container, Typography, Link, Modal, CardContent, Card, CardHeader, Grid, TextField, Button } from '@mui/material'
import { DashboardLayout } from '../components/dashboard-layout'

import { SERVER } from "../utils/config";

const UniswapNewTokens = () => {
  const style = {
    position: 'absolute',
    display: 'block',
    alignItems: 'center',
    justifyContent: 'center',
    top: '5%',
    left: '10%',
    width: '80%',
    height: '90%',
    overflow: 'overlay',
  }

  const [showFnModal, setShowFnModal] = useState(false)
  const [socket, setSocket] = useState('')
  const [tokensList, setTokensList] = useState([])
  const [pairs, setPairs] = useState([])
  const [abiFunctions, setAbiFunctions] = useState([])
  const [searchAddress, setSearchAddress] = useState('')
  const [listItems, setListItems] = useState([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    setSocket(socketIOClient(SERVER))
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        socket.emit("uniswap:one:getTokensList", response => {
          setTokensList(response)
          setPairs(response)
        })

        socket.on("uniswap:one:tokensList", (data) => {
          setTokensList(data)
          setPairs(data)
        })

      })
    }
    return () => {
      if (socket) socket.disconnect()
    }
  }, [socket])

  useEffect(() => {
    if (!isFetching) return
    fetchMoreListItems()
  }, [isFetching]);

  useEffect(() => {
    if (tokensList.length > 0) {
      setListItems(tokensList.slice(0, listItems.length + 21))
    } else {
      setListItems([])
    }
  }, [tokensList])

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) return
    setIsFetching(true)
  }

  const fetchMoreListItems = () => {
    setListItems(tokensList.slice(0, listItems.length + 20))
    setIsFetching(false)
  }

  const getABIForContract = (contract) => () => {
    if (socket) {
      socket.emit("uniswap:one:getContractInfo", contract, response => {
        if (response.data === 'Contract source code not verified') {
          toast.error(response.data, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
          })
        } else {
          const fns = response.data.filter((fn) => {
            return fn.type === 'function'
          })
          setAbiFunctions(fns)
          setShowFnModal(true)
        }
      })
    }
  }

  const handleSearchAddressChange = (evt) => {
    setSearchAddress(evt.target.value)
  }

  const handleSearch = (key) => {
    if (key.code === 'Enter' && searchAddress !== '') {
      const target = tokensList.filter(token => {
        return token.tokenName.toLowerCase() === searchAddress.toLowerCase()
      })
      setTokensList(target)
    } else if (key.code === 'Enter' && searchAddress === '') {
      setTokensList(pairs)
    }
  }

  const handleBuyToken = () => {
    console.log('handleBuyToken')
  }

  return (
    <>
      <Head>
        <title>
          Uniswap new tokens
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <Container
          maxWidth={false}
          sx={{ marginBottom: 3 }}
        >
          <Typography
            sx={{ mb: 3 }}
            variant="h4"
          >
            Uniswap tokens
          </Typography>
        </Container>
        <Container maxWidth={false}>
          <Card>
            <Grid
              container
              sx={{ flex: 1, justifyContent: 'start' }}
            >
              <Grid
                item
                md={6}
                xs={6}
                sx={{ margin: '10px' }}
              >
                <TextField
                  fullWidth
                  label="Contract Address"
                  name="searchAddress"
                  value={searchAddress}
                  onChange={handleSearchAddressChange}
                  onKeyPress={handleSearch}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
            {listItems && listItems.map((token) => (
              <CardContent key={token.txHash}>
                <Typography>
                  {token.name} ({token.symbol})
                </Typography>
                <Typography>
                  {token.tokenName}
                </Typography>
                <Link href={`https://etherscan.io/tx/${token.txHash}`}
                  underline="hover"
                  target="_blank"
                >
                  {token.txHash}
                </Link>
                <Typography>
                  Nonce: {token.nonce}, Function: {token.fnName}
                </Typography>
                <Link href={`https://etherscan.io/token/${token.tokenName}`}
                  underline="hover"
                  target="_blank"
                  sx={{ marginRight: '10px' }}
                >
                  Etherscan
                </Link>
                <Link href={`https://www.dextools.io/app/ether/pair-explorer/${token.tokenName}`}
                  underline="hover"
                  target="_blank"
                  sx={{ marginRight: '10px' }}
                >
                  DEXTOOLS
                </Link>
                <Link
                  type='button'
                  underline="hover"
                  sx={{ marginRight: '10px', cursor: 'pointer' }}
                  onClick={getABIForContract(token.tokenName)}
                >
                  ABI
                </Link>
                <Link href={`https://www.team.finance/view-coin/${token.tokenName}?name=${token.name}&symbol=${token.symbol}`}
                  underline="hover"
                  target="_blank"
                  sx={{ marginRight: '10px' }}
                >
                  LOCKED
                </Link>
              </CardContent>
            ))}
            {!!isFetching && (
              <Typography>
                Fetching more items ...
              </Typography>
            )}
          </Card>
        </Container>
      </Box>
      <Modal
        sx={style}
        open={showFnModal}
      >
        <Card>
          <CardHeader title="Functions" />
          <CardContent>
            {abiFunctions.map((fn, idx) => (
              <Grid
                key={`${fn.name}${idx}`}
                container
                spacing={3}
                sx={{ marginTop: '0px' }}
              >
                <Grid
                  item
                  md={3}
                  xs={3}
                  sx={{ wordBreak: 'break-all' }}
                >
                  {fn.name}
                </Grid>
                <Grid
                  item
                  md={3}
                  xs={3}
                >
                  {!!fn.inputs.length && (
                    <TextField
                      fullWidth
                      label="Input Params"
                      select
                      SelectProps={{ native: true }}
                      variant="outlined"
                      size="small"
                    >
                      <option
                        key={0}
                        value={'----'}
                      >
                        ----
                      </option>
                      {fn.inputs.map((param, idx) => (
                        <option
                          key={`${param.name}${idx}`}
                          value={param.name}
                        >
                          {param.name}
                        </option>
                      ))}
                    </TextField>
                  )}
                </Grid>
                <Grid
                  item
                  md={3}
                  xs={3}
                >
                </Grid>
                <Grid
                  item
                  md={3}
                  xs={3}
                >
                </Grid>
              </Grid>
            ))}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: 3,
                paddingBottom: 2
              }}
            >
              <Button
                color="success"
                variant="contained"
                onClick={handleBuyToken}
              >
                Buy
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={() => setShowFnModal(false)}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Modal>
    </>
  )
};

UniswapNewTokens.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default UniswapNewTokens;
