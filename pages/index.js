import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [message, setMessage] = useState(" ");
  const [newName, setnewName] = useState(" ");
  const [newAge, setnewAge] = useState(" ");

  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Connect Metamask Wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    //Added functionality

    async function setName() {
      if (atm) {
        let tx = await atm.updateName(newName);
        await tx.wait();

        alert("Successful");
        setnewName(" ");
      }
    }
    async function setAge() {
      if (atm) {
        let tx = await atm.updateAge(newAge);
        await tx.wait();

        alert("Successful");
        setnewAge(" ");
      }
    }
    async function getMessage() {
      if (atm) {
        let tx = await atm.getEntityDetails();
        const { name, age } = tx;

        const name1 = [`${name}  is ${age}  years old`];

        setMessage(name1);
      }
    }
    function handleMessageChange(e) {
      setnewName(e.target.value);
    }

    function handleAgeChange(e) {
      setnewAge(e.target.value);
    }

    function handleClearMessage(e) {
      setnewAge(" ");
      setnewName(" ");
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <br />
        <h3>
          <i>Set Name</i>
        </h3>
        <input
          type="text"
          placeholder="Set Message"
          value={newName}
          onChange={handleMessageChange}
        />
        <br />
        <button onClick={setName}>Set Name</button>
        <br />
        <input
          type="number"
          placeholder="Set age"
          value={newAge}
          onChange={handleAgeChange}
        />
        <br />
        <button onClick={setAge}>Set Age</button>
        <br />
        <br />
        <button onClick={getMessage}>Get Message</button>
        <h2>{message}</h2>
        <br />
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx global>{`
        body {
          padding: 0;
          margin: 0;
          min-height: 100vh;
          display: flex;
          width: 100%;
          text-align: center;
          justify-content: center;
          align-items: center;
          background-color: #000080;
          color: white;
        }
        button {
          background-color: black;
          padding: 1em;
          border-radius: 10px;
          border: 0;
          margin: 1em;
          color: white;
          font-weight: bold;
        }
      `}</style>
    </main>
  );
}
