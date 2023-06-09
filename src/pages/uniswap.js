import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic'
import socketIOClient from "socket.io-client";
import { gql } from "graphql-request";
import Head from "next/head";
import {
  Box,
  Container,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Modal,
  Card,
  CardHeader,
  CardContent,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  TableHead,
  Table,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Typography
} from "@mui/material";
import { DashboardLayout } from "../components/dashboard-layout";
import { toast } from "react-toastify";
import { SERVER } from "../utils/config";

const Uniswap = () => {
  const PriceChart = dynamic(() => import("../components/priceChart"), {
    ssr: false
  });
  const style = {
    position: "absolute",
    display: "block",
    alignItems: "center",
    justifyContent: "center",
    top: "5%",
    left: "10%",
    width: "80%",
    height: "90%",
    overflow: "overlay",
  };
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    private: "", //
    public: "", //
    privatePool: "", //
    publicPool: "", //
    waitTime: 0,
    eth: 0.001, //
    gasPrice: 10, // gwei
    gasLimit: 5000000, // number
    snipperToken: "", //
    snipperFunction: "",
    autoSellPriceTimes: 1.2,
    enableAutoSell: false,
    enableMiniAudit: false, // enable mini audit feature: scanning tokens to check if it has potential features that make it a scam / honeypot / rugpull etc
    checkSourceCode: true, // check contract source code
    checkV1Router: true, // check if pancakeswap v1 router is used or not
    checkValidV2Router: true, // check if pancakeswap v2 router is used or not
    checkMintFunction: true, //check if any mint function enabled
    checkHoneypot: true, //check if token is honeypot
  });
  const [wallets, setWallets] = useState([]);
  const [logData, setLogData] = useState([]);
  const [detailModalStatus, setDetailModalStatus] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [manualBuyTokenModalStatus, setManualBuyTokenModalStatus] = useState(false);
  const [buyTokenAddress, setBuyTokenAddress] = useState("");
  const [gasPrice, setGasPrice] = useState("0");
  const [manualBuyAmount, setManualBuyAmount] = useState("0");
  const [socket, setSocket] = useState("");
  const [viewChart, setViewChart] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [graphData, setGraphData] = useState([])

  let ohlcData = []

  const showDetailModal = (item) => () => {
    setDetailModalStatus(true);
    setDetailData(item);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleBotStart = (status) => () => {
    currentPlan.status = status;
    socket.emit("uniswap:one:setPlan", currentPlan, (response) => {
      setCurrentPlan(response.data);
    });
  };

  const handleManualBuyModal = () => {
    setManualBuyTokenModalStatus(true);
  };

  const handleManualBuyToken = () => {
    socket.emit(
      "uniswap:one:manualBuy",
      {
        tokenAddress: buyTokenAddress,
        public: currentPlan.public,
        private: currentPlan.private,
        value: manualBuyAmount,
        gasPrice: gasPrice,
        gasLimit: 500000,
        tTx: "",
      },
      (response) => {
        console.log(response);
      }
    );
  };

  const setPlan = () => {
    socket.emit("uniswap:one:setPlan", currentPlan, (response) => {
      setCurrentPlan(response.data);
      if (response.status === "success") {
        toast.success(response.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(response.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
    setModalOpen(false);
  };

  const move = (hash) => () => {
    socket.emit("uniswap:one:letMove", hash, (response) => {
      if (response.code === 1) {
        setLogData(response.data);
        toast.success(response.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(response.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
  };

  const del = (hash) => () => {
    socket.emit("uniswap:one:letDel", hash, (response) => {
      if (response.code === 1) {
        setLogData(response.data);
        toast.success(response.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(response.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
  };

  const sell = (hash) => () => {
    socket.emit("uniswap:one:letSell", hash, (response) => {
      if (response.code === 1) {
        setLogData(response.data);
        toast.success(response.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(response.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
  };

  const handleGraph = (timeInterval) => async () => {
    await setViewChart(true);
    setLoadingGraph(true);
    const query = gql`
      {
        ethereum(network: ethereum) {
          dexTrades(
            options: { limit: 100000, asc: "timeInterval.minute" }
            date: { since: "2021-05-23" }
            exchangeName: { is: "Uniswap" }
            baseCurrency: { is: "0x4d17082974c4a37ec13002998934a30818a4a9b2" }
            quoteCurrency: { is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" }
          ) {
            timeInterval {
              minute(count: ${timeInterval})
            }
            baseCurrency {
              symbol
              address
            }
            baseAmount
            quoteCurrency {
              symbol
              address
            }
            quoteAmount
            trades: count
            quotePrice
            maximum_price: quotePrice(calculate: maximum)
            minimum_price: quotePrice(calculate: minimum)
            open_price: minimum(of: block, get: quote_price)
            close_price: maximum(of: block, get: quote_price)
          }
        }
      }
    `;

    const url = "https://graphql.bitquery.io/";
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "BQYqraES49iKpALwQkbL8OuVvjfxk7gC",
      },
      body: JSON.stringify({ query }),
    };

    ohlcData = []

    try {
      await fetch(url, opts)
        .then((res) => res.json())
        .then((response) => {
          response.data.ethereum.dexTrades.map((data) => {
            ohlcData.push({
              time: Date.parse(data.timeInterval.minute) / 1000,
              open: Number(data.open_price),
              high: Number(data.maximum_price),
              low: Number(data.minimum_price),
              close: Number(data.close_price),
            });
          });
        })
        .catch((err) => console.log("Error ----------", err));
    } catch (error) {
      console.log(error);
    }

    setGraphData(ohlcData)

    setLoadingGraph(false);
  };

  const str2bool = (value) => {
    if (value && typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return value;
  };

  const handleChange = (e) => {
    if (e.target.name === "public") {
      const botPrivate = wallets.find((wallet) => {
        return wallet.public === e.target.value;
      });
      setCurrentPlan({
        ...currentPlan,
        [e.target.name]: e.target.value,
        private: botPrivate ? botPrivate.private : "",
      });
    } else if (e.target.name === "publicPool") {
      const poolPrivate = wallets.find((wallet) => {
        return wallet.public === e.target.value;
      });
      setCurrentPlan({
        ...currentPlan,
        [e.target.name]: e.target.value,
        privatePool: poolPrivate ? poolPrivate.private : "",
      });
    } else if (e.target.name === "enableAutoSell" || e.target.name === "enableMiniAudit") {
      setCurrentPlan({
        ...currentPlan,
        [e.target.name]: str2bool(e.target.value),
      });
    } else if (
      [
        "checkHoneypot",
        "checkMintFunction",
        "checkSourceCode",
        "checkV1Router",
        "checkValidV2Router",
      ].indexOf(e.target.name) !== -1
    ) {
      setCurrentPlan({
        ...currentPlan,
        [e.target.name]: e.target.checked,
      });
    } else {
      setCurrentPlan({
        ...currentPlan,
        [e.target.name]: e.target.value,
      });
    }
  };

  useEffect(() => {
    setSocket(socketIOClient(SERVER));
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        socket.emit("uniswap:one:getplan", (response) => {
          if (response) {
            if (response.plan) setCurrentPlan(response.plan);
            setWallets(response.wallet);
          } else {
            setCurrentPlan({
              private: "", //
              public: "", //
              privatePool: "", //
              publicPool: "", //
              waitTime: 0,
              eth: 0.001, //
              gasPrice: 100, // gwei
              gasLimit: 500000, // number
              snipperToken: "", //
              snipperFunction: "", //
              autoSellPriceTimes: 1.2,
              enableAutoSell: false,
              enableMiniAudit: false, // enable mini audit feature: scanning tokens to check if it has potential features that make it a scam / honeypot / rugpull etc
              checkSourceCode: true, // check contract source code
              checkV1Router: true, // check if pancakeswap v1 router is used or not
              checkValidV2Router: true, // check if pancakeswap v2 router is used or not
              checkMintFunction: true, //check if any mint function enabled
              checkHoneypot: true, //check if token is honeypot
            });
            setWallets(response.wallet);
          }
        });
        socket.emit("uniswap:one:getLogs", (response) => {
          setLogData(response);
        });

        socket.on("uniswap:one:logStatus", (data) => {
          setLogData(data);
        });

        socket.on("uniswap:one:newTokenBought", (data) => {
          toast.success(`Hash:${data}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });

        socket.on("uniswap:one:tokenMoved", (data) => {
          toast.success(`Moved to main pool, Hash:${data}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });

        socket.on("uniswap:one:tokenSelled", (data) => {
          toast.success(`Token selled, Hash:${data}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });
      });
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <>
      <Head>
        <title>UniSwap</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <Container sx={{ marginBottom: 3 }} maxWidth={false}>
          <Card>
            <CardContent sx={{ display: "flex", justifyContent: "end" }}>
              <Button
                color="info"
                variant="contained"
                onClick={handleManualBuyModal}
                sx={{ marginRight: "20px" }}
              >
                Manual Buy
              </Button>
              <Button
                color="info"
                variant="contained"
                onClick={handleGraph(1)}
                sx={{ marginRight: "20px" }}
              >
                Get Graph
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={handleModalOpen}
                sx={{ marginRight: "20px" }}
              >
                Setting
              </Button>
              <Button
                position="flex-end"
                color="secondary"
                variant="contained"
                onClick={handleBotStart(currentPlan.status === 0 ? 1 : 0)}
              >
                {currentPlan.status ? "Stop Bot" : "Start Bot"}
              </Button>
            </CardContent>
          </Card>
        </Container>

        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableCell component="tr">
                  <TableCell component="th" sx={{ width: "500px" }}>
                    Token
                  </TableCell>
                  <TableCell>Bought Price</TableCell>
                  <TableCell>Current Price</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Approve</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Status At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableCell>
              </TableHead>
              <TableBody>
                {logData.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell scope="row">
                      <a
                        href={`https://etherscan.com/address/${item.boughtToken}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {log.boughtToken}
                      </a>
                    </TableCell>
                    <TableCell>{log.boughtPrice}</TableCell>
                    <TableCell>{log.currentPrice}</TableCell>
                    <TableCell>{log.curRate}</TableCell>
                    <TableCell>{log.approveStatus}</TableCell>
                    <TableCell>{log.txStatus}</TableCell>
                    <TableCell>{log.created}</TableCell>
                    <TableCell sx={{ flexGrow: 1 }}>
                      <Button
                        color="error"
                        variant="contained"
                        size="small"
                        onClick={showDetailModal(log)}
                      >
                        Detail
                      </Button>
                      <Button color="error" variant="contained" size="small" onClick={del(log.bTx)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
      <Modal sx={style} open={isModalOpen} disableEscapeKeyDown>
        <form autoComplete="off" name="form">
          <Card>
            <CardHeader
              sx={{
                paddingBottom: "0px",
              }}
              title="Set Plan for UniSwap Sniper"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    helperText="Tokens that you want to snipe, Please type exactly."
                    label="Token Name"
                    name="snipperToken"
                    onChange={handleChange}
                    value={currentPlan.snipperToken}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    helperText="Functions for snipe."
                    label="Sniper Function"
                    name="snipperFunction"
                    onChange={handleChange}
                    value={currentPlan.snipperFunction}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    label="Select bot wallet"
                    name="public"
                    onChange={handleChange}
                    required
                    error={currentPlan.public === ""}
                    select
                    SelectProps={{ native: true }}
                    value={currentPlan.public}
                    variant="outlined"
                    size="small"
                  >
                    <option key={0} value={""}></option>
                    {wallets.map((wallet) => (
                      <option key={wallet.public} value={wallet.public}>
                        {wallet.public}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    name="private"
                    variant="outlined"
                    size="small"
                    type="password"
                    value={currentPlan.private}
                    disabled
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    label="Select pool wallet"
                    name="publicPool"
                    onChange={handleChange}
                    required
                    error={currentPlan.publicPool === ""}
                    select
                    SelectProps={{ native: true }}
                    value={currentPlan.publicPool}
                    variant="outlined"
                    size="small"
                  >
                    <option key={0} value={""}></option>
                    {wallets.map((wallet) => (
                      <option key={wallet.public} value={wallet.public}>
                        {wallet.public}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    name="botPrivateKey"
                    value={currentPlan.privatePool}
                    type="password"
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="WETH amount(Array with comma)"
                    name="eth"
                    onChange={handleChange}
                    required
                    error={currentPlan.eth === ""}
                    value={currentPlan.eth}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Wait Time(Array with comma)"
                    name="waitTime"
                    required
                    error={currentPlan.waitTime === ""}
                    onChange={handleChange}
                    value={currentPlan.waitTime}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Gas price(in gwei > 5)"
                    name="gasPrice"
                    onChange={handleChange}
                    required
                    error={currentPlan.gasPrice === ""}
                    value={currentPlan.gasPrice}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Gas limit(in general > 5000000)"
                    name="gasLimit"
                    onChange={handleChange}
                    required
                    error={currentPlan.gasLimit === ""}
                    value={currentPlan.gasLimit}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <FormLabel component="legend">Enable mini audit</FormLabel>
                  <RadioGroup
                    row
                    aria-label="Enable mini audit"
                    name="enableMiniAudit"
                    value={currentPlan.enableMiniAudit}
                    onChange={handleChange}
                  >
                    <FormControlLabel value={true} control={<Radio />} label="Enable" />
                    <FormControlLabel value={false} control={<Radio />} label="Disable" />
                  </RadioGroup>
                </Grid>
                <Grid item md={9} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="checkSourceCode"
                        checked={currentPlan.checkSourceCode}
                        onChange={handleChange}
                        disabled={!currentPlan.enableMiniAudit}
                      />
                    }
                    label="Source code"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="checkMintFunction"
                        checked={currentPlan.checkMintFunction}
                        onChange={handleChange}
                        disabled={!currentPlan.enableMiniAudit}
                      />
                    }
                    label="Mint function"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="checkV1Router"
                        checked={currentPlan.checkV1Router}
                        onChange={handleChange}
                        disabled={!currentPlan.enableMiniAudit}
                      />
                    }
                    label="V1 Router"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="checkValidV2Router"
                        checked={currentPlan.checkValidV2Router}
                        onChange={handleChange}
                        disabled={!currentPlan.enableMiniAudit}
                      />
                    }
                    label="V2 Router"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="checkHoneypot"
                        checked={currentPlan.checkHoneypot}
                        onChange={handleChange}
                        disabled={!currentPlan.enableMiniAudit}
                      />
                    }
                    label="Honey Pot"
                    labelPlacement="top"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <FormLabel component="legend">Enable auto sell</FormLabel>
                  <RadioGroup
                    row
                    aria-label="Enable auto sell"
                    name="enableAutoSell"
                    value={currentPlan.enableAutoSell}
                    onChange={handleChange}
                  >
                    <FormControlLabel value={true} control={<Radio />} label="Enable" />
                    <FormControlLabel value={false} control={<Radio />} label="Disable" />
                  </RadioGroup>
                </Grid>
                {currentPlan.enableAutoSell === true && (
                  <Grid item md={6} xs={12}>
                    <FormLabel component="legend">Auto sell rate</FormLabel>
                    <TextField
                      fullWidth
                      name="autoSellPriceTimes"
                      type="number"
                      onChange={handleChange}
                      value={currentPlan.autoSellPriceTimes}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: 3,
                paddingBottom: 2,
              }}
            >
              <Button
                sx={{ marginRight: 2 }}
                type="submit"
                color="primary"
                variant="contained"
                onClick={setPlan}
              >
                Save Plan
              </Button>
              <Button color="error" variant="contained" onClick={handleCloseModal}>
                Cancel
              </Button>
            </Box>
          </Card>
        </form>
      </Modal>
      <Modal sx={style} open={detailModalStatus}>
        <Card>
          <CardHeader
            sx={{
              paddingBottom: "0px",
            }}
            title="Transaction Detail"
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Bought Token"
                  name="boughtToken"
                  disabled
                  value={detailData.boughtToken}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Bought Token"
                  name="boughtToken"
                  disabled
                  value={detailData.boughtPrice}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Bought Token"
                  name="boughtToken"
                  disabled
                  value={detailData.currentPrice}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item md={1} xs={3}>
                {(detailData.status === 1 || detailData.status === 6) && (
                  <Button color="warning" size="small" onClick={move(detailData.bTx)}>
                    move
                  </Button>
                )}
              </Grid>
              <Grid item md={1} xs={3}>
                {(detailData.status === 5 ||
                  detailData.status === 9 ||
                  detailData.status === 6) && (
                    <Button color="warning" size="small" onClick={sell(detailData.bTx)}>
                      Sell
                    </Button>
                  )}
              </Grid>
              <Grid item md={1} xs={3}>
                {(detailData.status === 5 ||
                  detailData.status === 9 ||
                  detailData.status === 6) && (
                    <Button color="error" size="small" onClick={del(detailData.bTx)}>
                      Sell
                    </Button>
                  )}
              </Grid>
              <Grid item md={1} xs={3}>
                <Button color="primary" size="small">
                  <a
                    className="text-white"
                    href={`https://etherscan.com/tx/${detailData.tTx}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Token Transaction
                  </a>
                </Button>
              </Grid>
              <Grid item md={1} xs={3}>
                <Button color="primary" size="small">
                  <a
                    className="text-white"
                    href={`https://etherscan.com/tx/${detailData.bTx}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buy Transaction
                  </a>
                </Button>
              </Grid>
              <Grid item md={1} xs={3}>
                {(detailData.status === 4 ||
                  detailData.status === 5 ||
                  detailData.status === 6) && (
                    <Button color="default" size="small">
                      <a
                        className="text-white"
                        href={`https://etherscan.com/tx/${detailData.mTx}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Move Transaction
                      </a>
                    </Button>
                  )}
              </Grid>
              <Grid item md={1} xs={3}>
                {(detailData.status === 7 ||
                  detailData.status === 8 ||
                  detailData.status === 9) && (
                    <Button color="default" size="small">
                      <a
                        className="text-white"
                        href={`https://etherscan.com/tx/${detailData.sTx}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Sell Transaction
                      </a>
                    </Button>
                  )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Modal>
      <Modal sx={style} open={manualBuyTokenModalStatus}>
        <Card>
          <CardHeader
            sx={{
              paddingBottom: "0px",
            }}
            title="Manual Buy"
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={12} xs={12}>
                <TextField
                  fullWidth
                  label="Token address"
                  name="buyTokenAddress"
                  value={buyTokenAddress}
                  onChange={(e) => {
                    setBuyTokenAddress(e.target.value);
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="WETH Amount"
                  name="amoutn"
                  value={manualBuyAmount}
                  onChange={(e) => {
                    setManualBuyAmount(e.target.value);
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Gas Price(in gwei)"
                  name="gasPrice"
                  value={gasPrice}
                  onChange={(e) => {
                    setGasPrice(e.target.value);
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item md={12} xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                <Button
                  color="success"
                  variant="contained"
                  size="small"
                  onClick={handleManualBuyToken}
                  sx={{ marginRight: "20px" }}
                >
                  Buy
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  onClick={() => setManualBuyTokenModalStatus(false)}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Modal>
      <Modal sx={style} open={viewChart}>
        <Card>
          <CardHeader
            sx={{
              paddingBottom: "0px",
            }}
            title="Graph"
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={12} xs={12}>
                {loadingGraph && <CircularProgress />}
                {!loadingGraph && (
                  <Box sx={{ display: 'flex' }}>
                    <Typography
                      sx={{ mr: '5px', cursor: 'pointer' }}
                      onClick={handleGraph(1)}
                    >
                      1m
                    </Typography>
                    <Typography
                      sx={{ mr: '5px', cursor: 'pointer' }}
                      onClick={handleGraph(5)}
                    >
                      5m
                    </Typography>
                    <Typography
                      sx={{ mr: '5px', cursor: 'pointer' }}
                      onClick={handleGraph(15)}
                    >
                      15m
                    </Typography>
                    <Typography
                      sx={{ mr: '5px', cursor: 'pointer' }}
                      onClick={handleGraph(60)}
                    >
                      1h
                    </Typography>
                  </Box>
                )}
                <PriceChart graphData={graphData} />
              </Grid>
              <Grid item md={12} xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  onClick={() => setViewChart(false)}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Modal>
    </>
  );
};

Uniswap.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Uniswap;
