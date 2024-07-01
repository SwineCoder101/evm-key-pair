import logo from './MetaMask_Fox.svg';
import metamaskimage from './metamask-icon.png';
import './App.css';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { createTransaction } from "./sendMessage";
const ethers = require('ethers');

function App() {
  // check if metamask is installed
  const [haveMetamask, sethaveMetamask] = useState(true);
  // address of the connected wallet
  const [accountAddress, setAccountAddress] = useState('');
  // check if wallet is connected
  const [isConnected, setIsConnected] = useState(false);
  // check if signature is copied
  const [signatureCopied, setSignatureCopied] = useState(false);
  // check if address is copied
  const [addressCopied, setAddressCopied] = useState(false);
  // check if message is signed
  const [signed, setSigned] = useState(false);

  let signature = '';

  const { ethereum } = window;
  const [sig, setSig] = useState('');


  // check if metamask is installed, signature is copied, address is copied
  useEffect(() => {
    if (signatureCopied || addressCopied) {
      const timer = setTimeout(() => {
        setSignatureCopied(false);
        setAddressCopied(false);
      }, 1000);
  
      return () => clearTimeout(timer);
    }

    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, [signatureCopied, addressCopied]);

  // check if wallet is connected
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccountAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  // disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsConnected(false);
      setAccountAddress('');
    } catch (error) {
      setIsConnected(true);
    }
  };

  const handleEdit = async () => {}
  const handleDelete = async () => {}
  const handleCreate = async () => {}
  
  // sign message by metamask
  const signMessage = async () => {
    setSigned(false);
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    // message must be hex encoded
    let msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
    
    // use method personal_sign to sign message
    signature = await ethereum.request({
      method: 'personal_sign',
      params: [msg, accountAddress, 'Example password'],
    });

    // take the recovered address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature); 

    // check if the recovered address is the same as the connected wallet address
    if (recoveredAddress.toLowerCase() === accountAddress) {
      alert('Signature verified');
      messageInput.value = '';
      // set the signature to the state
      setSig(await createTransaction(message, recoveredAddress, signature));
      setSigned(true);
    } else {
      alert('Signature failed');
    }
  };


  // copy address to clipboard
  const copyAddessToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accountAddress);
      setAddressCopied(true);
    } catch (err) {
      alert("Failed to copy signature to clipboard.");
    }
  };

  // copy signature to clipboard
  const copySignatureToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sig);
      setSignatureCopied(true);
    } catch (err) {
      alert("Failed to copy signature to clipboard.");
    }
  };
  

  return (
    <div className="App">
      <header className="App-header">
        {haveMetamask ? (
          <div className="App-header">
            {isConnected ? (
              <div className="card">
                <div className="card-row">
                  <div className="metamask-button">
                    <img src={metamaskimage} alt="Metamask" />
                    <span id="wallet-address" onClick={copyAddessToClipboard}>{accountAddress.slice(0,10)}...{accountAddress.slice(-10)}</span>
                    {addressCopied && (
                      <span style={{ position: "absolute", top: "-40px", right: 0 , fontSize: "20px", backgroundColor:"white"}}>Copied</span>
                    )}
                  </div>
                  <div className="card-row">
                    <h3>Note Utility Create/Edit/Delete:</h3>
                    <input
                      type="text"
                      id="message-input"
                      className="message-input"
                      placeholder="Enter the Note Name"/>
                    <input
                      type="text"
                      id="message-input"
                      className="message-input"
                      placeholder="Enter some content"/>
                    <button className="btn" onClick={handleCreate}>
                      Create note
                    </button>
                    <button className="btn" onClick={handleEdit}>
                      Edit note
                    </button>
                    <button className="btn" onClick={handleDelete}>
                      Delete note
                    </button>
                    {signed && (
                      <div className="card-row">
                        <h3>Transaction hash:</h3>
                        <div className="metamask-button">
                          <span id="wallet-address" onClick={copySignatureToClipboard}>{sig.slice(0,10)}...{sig.slice(-10)}</span>
                          {signatureCopied && (
                            <span style={{ position: "absolute", top: "-40px", right: 0 , fontSize: "20px", backgroundColor:"white"}}>Copied</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <img src={logo} className="App-logo" alt="logo" />
            )}
            {isConnected ? (
              <button className="btn" onClick={disconnectWallet}>
                Disconnect MetaMask
              </button>
            ) : (
              <button className="btn" onClick={connectWallet}>
                Connect MetaMask
              </button>
              
            )}
          </div>
        ) : (
          <p>Please Install MataMask</p>
        )}
      </header>
    </div>
  );
}

export default App;