import { ethers, utils } from 'ethers'
import { useEffect, useState } from 'react'
import abi from './contracts/ERC20Token.json'
import './App.css'

function App() {
  const CONTRACT_ADDRESS = "0x7483929cE584f84c415f83A769F9B8268d7E9743"
  const ABI = abi.abi

  const [coinProperties, setCoinProperties] = useState({
    coin: "",
    ticker: "",
    token: ""
  })
  const [balance, setBalance] = useState("")

  const [truncate, setTruncate] = useState("hidden")
  const [eventsError, setEventsError] = useState()

  const [loadingMint, setLoadingMint] = useState(false)
  const [loadingBurn, setLoadingBurn] = useState(false)
  const [loadingTransfer, setLoadingTransfer] = useState(false)
  const [mint, setMint] = useState("")
  const [burn, setBurn] = useState("")
  const [owner, setOwner] = useState(false)
  const [transferForm, setTransferForm] = useState({
    to: "",
    amount: ""
  })

  const [walletConnected, setWalletConnected] = useState(false)
  const [address, setAddress] = useState("0x000000000000000000000000000")

  const collectWallet = async() => {
    if (window.ethereum !== undefined) {
      const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
      const account = accounts[0]
      setAddress(account)
      setWalletConnected(true)
    }else{
      setTruncate("")
      setEventsError("Please install Metamask to get started")
    }
  }

  const providers = () => {
    return new ethers.providers.Web3Provider(window.ethereum)
  }

  const signers = () => {
    return providers().getSigner()
  }

  const contracts = () => {
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signers()) 
  }

  const Events = () => {
    const events = contracts()

    events.on("MintMore", (amount, msg) => {
      setLoadingMint(false)
      setTruncate("")
      setEventsError(msg)
      setMint("")
    })

    events.on("TransferFund", (amount, to, msg) => {
      setLoadingTransfer(false)
      setTruncate("")
      setEventsError(msg)
      setTransferForm(prevState => ({...prevState, to: ""}))
      setTransferForm(prevState => ({...prevState, amount: ""}))
    })

    events.on("BurnToken", (amount, msg) => {
      setLoadingBurn(false)
      setTruncate("")
      setEventsError(msg)
      setBurn("")
    })
  }

  const EventsProvider = () => {
    if (window.ethereum !== undefined) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAddress(accounts)
      })
    }
  }

  // Functions to update state of application
  const getCoinProperties = async () => {
    try {
      const coin = await contracts().name()
      const ticker = await contracts().symbol()
      const token = await contracts().totalSupply()
  
      setCoinProperties(prevCoinProperties =>  ({...prevCoinProperties, coin: coin}))
      setCoinProperties(prevCoinProperties =>  ({...prevCoinProperties, ticker: ticker}))
      setCoinProperties(prevCoinProperties =>  ({...prevCoinProperties, token: utils.formatEther(token)}))
    } catch (error) {
      console.error(error)
    }
  }

  const getBalance = async () => {
    try {
      const balance = await contracts().getBalance()
      setBalance(utils.formatEther(balance))
    } catch (error) {
      console.error(error)
    }
  }

  const handleChangeMint = (e) => {
    setMint(e.target.value)
  }

  const handleSubmitMint = (e) => {
    e.preventDefault()
    if (mint != "") {
      setLoadingMint(true)
      mintMore(mint)
    }
  }

  const mintMore = async(mint) => {
    console.log(mint)
    try {
      await contracts().mint(utils.parseEther(mint))
      Events()
    } catch (error) {
      setLoadingMint(false)
      setEventsError(error.message)
      setTruncate("")
    }
  }

  const handleChangeBurn = (e) => {
    setBurn(e.target.value)
  }

  const handleSubmitBurn = (e) => {
    e.preventDefault()
    if (burn != "") {
      setLoadingBurn(true)
      burnMore(burn)
    }
  }

  const burnMore = async(burn) => {
    try {
      await contracts().burn(utils.parseEther(burn))
      Events()
    } catch (error) {
      setLoadingBurn(false)
      setEventsError(error.message)
      setTruncate("")
    }
  }

  const handleChangeTransfer = (e) => {
    setTransferForm({...transferForm, [e.target.name]: e.target.value})
  }

  const handleSubmitTransfer = (e) => {
    e.preventDefault()
    if (transferForm.to !== "" && transferForm.amount !== "") {
      setLoadingTransfer(true)
      transferFunds(transferForm.to, transferForm.amount)
    }
  }

  const transferFunds = async (to , amount) => {
    try {
      await contracts().transferFunds(to, utils.parseEther(amount))
      Events()
    } catch (error) {
      setLoadingTransfer(false)
      setEventsError(error.message)
    }
  }

  const checkOwner = async () => {
    const owner = await contracts().checkOwner()
    setOwner(owner)
  }

  useEffect(() => {
    if (!walletConnected) {
      collectWallet()
    }
    getCoinProperties()
    getBalance()
    EventsProvider()
    checkOwner()
  }, [walletConnected, eventsError, transferForm, mint, address])

  return (
    <div className="App h-screen bg-slate-800 flex flex-col justify-center items-center">
      <div className={'w-11/12 md:w-7/12 m-auto flex justify-between text-white bg-sky-400 py-4 px-3 -mb-4 rounded ' + truncate}>
        <p className='text-sm truncate'>{eventsError}</p>
        <input type="submit" value="X" className='hover:cursor-pointer' onClick={() => setTruncate("hidden")}/>
      </div>
      <div className='w-11/12 md:w-7/12 m-auto border border-gray-500 p-4 rounded shadow-md text-white '>
        <div className='flex flex-row justify-between my-4 text-sm'>
          <div className='flex flex-row items-center justify-center'>
            <p className='mr-1'>Coin:</p>
            <p className='mr-1'>{coinProperties.coin === "" ? <div className="loader"></div> : coinProperties.coin }</p>
            🇰🇪
          </div>
          <div className='flex flex-row items-center justify-center'>
            <p className='mr-1'>Ticker:</p>
            <p>{coinProperties.ticker === "" ? <div className="loader"></div> : coinProperties.ticker}</p>
          </div>
          <div className='flex flex-row items-center justify-center'>
            <p className='mr-1'>Tokens:</p>
            <p>{coinProperties.token === "" ? <div className="loader"></div> : coinProperties.token}</p>
          </div>
        </div>
        <div className='flex flex-row my-4 text-sm items-center'>
          <p>Your Address: </p>
          <p className='truncate text-gray-400 ml-2'>{address}</p>
        </div>
        <div className='flex flex-row my-4 text-sm items-center'>
          <p>Balance: </p>
          <p className='truncate text-gray-400 ml-2'>{balance === "" ? <div className="loader"></div> : balance}</p>
        </div>
        <div className='' onSubmit={handleSubmitTransfer}>
          <form method="post" className='flex flex-col rounded border border-gray-500 py-3 px-2'>
            <input type="text" name="to" value={transferForm.to} onChange={handleChangeTransfer} placeholder='0x0000000000000000000000000000' id="" className='outline-none border border-slate-300 rounded px-2 py-1 bg-slate-400 my-1' autoComplete='off'/>
            <input type="text" name="amount" value={transferForm.amount} onChange={handleChangeTransfer} placeholder='Tokens e.g 10' id="" className='outline-none border border-slate-300 rounded px-2 py-1 bg-slate-400 my-1' autoComplete='off'/>
            <input type="submit" value={loadingTransfer ? "Sending .." : "Transfer"} disabled={loadingTransfer} className={loadingTransfer ? 'py-1 bg-sky-500 opacity-50 rounded': 'py-1 bg-sky-500 hover:cursor-pointer hover:opacity-50 rounded'}/>
          </form>
        </div>
        {!owner ? <p className='py-2 text-sm text-gray-200'><span className='text-red-500'>*</span> Only owner can burn tokens!</p>: null}
        <form method='post' onSubmit={handleSubmitMint} className='flex flex-row justify-center items-center my-2'>
          <input type="text" autoComplete='off' name="mint" value={mint} onChange={handleChangeMint} placeholder='Tokens e.g 10' id="" className='outline-none mr-2 w-full rounded px-2 py-1 bg-slate-400 my-1'/>
          <input type="submit" value={loadingMint ? "Minting .." : "Mint"} disabled={loadingMint} className={loadingMint ? 'px-2 py-1 bg-sky-500 opacity-50 rounded': 'px-2 py-1 bg-sky-500 hover:cursor-pointer hover:opacity-50 rounded'}/>
        </form>
        <form method='post' onSubmit={handleSubmitBurn} className='flex flex-row justify-center items-center my-2'>
          <input type="text" autoComplete='off' name="burn" value={burn} onChange={handleChangeBurn} placeholder='Tokens e.g 10' id="" className='outline-none mr-2 w-full rounded px-2 py-1 bg-slate-400 my-1'/>
          <input type="submit" value={loadingBurn ? "Destroying .." : "Burn"} className={loadingBurn ? 'px-2 py-1 bg-red-500 opacity-50 rounded' : 'px-2 py-1 bg-red-500 hover:cursor-pointer hover:opacity-50 rounded'}/>
        </form>
      </div>
    </div>
  )
}

export default App
