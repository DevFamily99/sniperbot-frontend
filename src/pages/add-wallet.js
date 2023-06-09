import { useState, useEffect } from 'react'
import Head from 'next/head';
import { Box, Container, Typography, TextField, Button, CardContent, Card, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle } from '@mui/material';
import { toast } from 'react-toastify'
import DeleteIcon from '@mui/icons-material/Delete'
import { DashboardLayout } from '../components/dashboard-layout';
import { addWallet, getWallet, removeWallet } from '../services/api'

const Settings = () => {
  const [privateKey, setPrivateKey] = useState('')
  const [wallets, setWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleChange = (e) => {
    setPrivateKey(e.target.value)
  }

  const handleSubmit = () => {
    addWallet({
      privateKey
    }).then((res) => {
      if (res.data.status === 'failed') {
        toast.error(res.data.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.success('Wallet added successfully', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      getWallet().then((res) => {
        setWallets(res.data)
      })
    }).catch((error) => {
      console.log(error)
    })
  }

  const handleWalletRemove = address => () => {
    setSelectedWallet(address)
    setShowConfirmDialog(true)
  }

  const handleConfirmRemove = () => {
    removeWallet({
      public: selectedWallet
    }).then((res) => {
      if (res.data.status === 'success') {
        toast.success(res.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(res.data.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      getWallet().then((res) => {
        setShowConfirmDialog(false)
        setWallets(res.data)
      })
    }).catch((error) => {
      console.log(error)
    })
  }

  useEffect(() => {
    getWallet().then((res) => {
      setWallets(res.data)
    })
  }, []);

  const RemoveIcon = address => (
    <IconButton
      color="primary"
      onClick={handleWalletRemove(address)}
    >
      <DeleteIcon color="error" />
    </IconButton>
  )

  return (
    <>
      <Head>
        <title>
          Wallets
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
            Wallets
          </Typography>
          <TextField
            sx={{ width: '90%' }}
            label="Wallet private key"
            name="privateKey"
            onChange={handleChange}
            required
            error={privateKey === ''}
            value={privateKey}
            variant="outlined"
            size="small"
          />
          <Button
            sx={{ marginLeft: 3, width: '7%' }}
            color="primary"
            variant="contained"
            onClick={handleSubmit}
          >
            Add
          </Button>
        </Container>
        <Container maxWidth={false}>
          <Card>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>BNB Amount</TableCell>
                    <TableCell>ETH Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow
                      key={wallet.public}
                    >
                      <TableCell>{wallet.public}</TableCell>
                      <TableCell>{wallet.bnb}</TableCell>
                      <TableCell>{wallet.eth}</TableCell>
                      <TableCell>{RemoveIcon(wallet.public)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Dialog
        onClose={() => setShowConfirmDialog(false)}
        open={showConfirmDialog}
      >
        <DialogTitle>
          Are you sure to remove wallet?
        </DialogTitle>
        <Box
          sx={{ textAlign: 'center', marginBottom: '20px' }}
        >
          <Button
            color="success"
            variant="contained"
            onClick={handleConfirmRemove}
            sx={{ marginRight: '10px' }}
          >
            Confirm
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => setShowConfirmDialog(false)}
            sx={{ marginLeft: '10px' }}
          >
            Cancel
          </Button>
        </Box>
      </Dialog>
    </>
  )
};

Settings.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Settings;
