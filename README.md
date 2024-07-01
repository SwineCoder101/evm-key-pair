# Note Taking App on Solana with EVM Sign-on

## Description
This is a note taking app built on solana where users can create,edit,delete note messages on-chain and sign with an EVM based wallet (metamask)
Everytime the user interacts with the dapp they will need to sign using their EVM based wallet. This project allows interopability on signing between
Ethereum on Solana.

![image](https://github.com/SwineCoder101/evm-key-pair/assets/20050550/298968c1-7345-4dcb-81d0-3cc7dd1f6f2d)

## TechStack
This an Anchor project where program/account development resides in programs. The frontend react-app and node server (for gasless transactions) is in the app folder
Anchor | Rust | Reactjs | Typescript | web3js

## System Architecture, 
The backend of the system architecture comprises of a note program/accounts used to create/edit/delete notes on behalf of the user.
Each interaction however will require a signature from an EVM based Wallet. This will be achieved using a CPI call to a secp256k1 solana native program 
[https://docs.solanalabs.com/runtime/programs](https://docs.solanalabs.com/runtime/programs#secp256k1-program)

Upon signing the user can then alter the state of the accounts using the interface shown above. Here is a brief overview of the architecture

![image](https://github.com/SwineCoder101/evm-key-pair/assets/20050550/88ebd9bb-dca7-4f73-93fc-9aed087f128a)


### What is complete

- **Backend:**
  - Business logic for creating/editing/deleting notes on the Solana chain
  - Node server for confirming transactions on behalf of the user to make the dapp gasless

- **Frontend:**
  - Basic interface for notes with a MetaMask connection

### What is left

- **Backend:**
  - CPI call to the secp256k1 Solana native program

- **Frontend:**
  - Program interactions to edit/create/delete notes

