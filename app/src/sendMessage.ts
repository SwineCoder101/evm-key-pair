const cors = require('cors');
import * as web3 from '@solana/web3.js';

export type CreateSecp256k1InstructionWithEthAddressParams = {
    ethAddress: Buffer | Uint8Array | Array<number> | string;
    message: Buffer | Uint8Array | Array<number>;
    signature: Buffer | Uint8Array | Array<number>;
    recoveryId: number;
    instructionIndex?: number;
  };

function hexToUint8Array(hexString: string, length: number): Uint8Array {
if (hexString.length !== length * 2) {
    throw new Error(
    `Invalid hex string length. Expected ${length * 2} characters.`
    );
}
const byteArray = new Uint8Array(length);
for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
    byteArray[j] = parseInt(hexString.slice(i, i + 2), 16);
}
return byteArray;
}

export const createTransaction = async (msg: string, addr: string, sig: string) => {
    // message to sign
    const message = `\x19Ethereum Signed Message:\n${msg.length}${msg}`;
    const messageBuffer = Buffer.from(message, "utf8");
    
    // convert address and signature to Uint8Array
    const ethAddress = hexToUint8Array(addr.slice(2), 20);
    const signature = hexToUint8Array(sig.slice(2, -2), 64);
    const recoveryId = parseInt(sig.slice(-2), 16);
    
    // struct to pass to createInstructionWithEthAddress
    const example1: CreateSecp256k1InstructionWithEthAddressParams = {
      ethAddress: ethAddress,
      message: messageBuffer,
      signature: signature,
      recoveryId: recoveryId-27,
      instructionIndex: 0,
    };
    //connection to devnet
    const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");

    // create sender keypair
    const sender = web3.Keypair.fromSecretKey(
      Uint8Array.from([98,74,162,26,34,99,60,20,71,237,28,176,152,127,176,102,204,31,224,148,72,127,255,253,17,91,255,82,72,162,96,131,115,147,61,73,32,136,6,71,192,85,35,243,231,134,174,121,66,241,177,139,248,89,178,248,89,57,145,19,233,117,10,3])
    );
    console.log("sender", sender.publicKey.toString());
    
    // server's public key
    const payer =  new web3.PublicKey("5aMGztMuSVPAp4nm6vrkU25BAho6gGxpWHnnaKZfiUHP");
    
    // instruction 1
    const instruction =
      web3.Secp256k1Program.createInstructionWithEthAddress(example1);
    
    // get latest blockhash
    const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash();
    
    // create transaction
    const transaction = new web3.Transaction(
      {
        feePayer: payer,
        blockhash,
        lastValidBlockHeight,
      }
    );
    
    // add instruction to transaction
    transaction.add(instruction);
    
    // add instruction to transaction
    transaction.add(
      new web3.TransactionInstruction({
        data: messageBuffer,
        keys: [
          { 
            // this instruction have signer is sender
            pubkey: sender.publicKey,
            isSigner: true,
            isWritable: true,
          },
        ],
        // my program id
        programId: new web3.PublicKey("BhEq6GCv279xqKAgRKD2GiKA3Fw4sV3ozx9XKK9GAihX"),
      })
    );
    
    // sign transaction with sender's private key
    transaction.partialSign(sender);
    console.log("transaction", transaction);
    
    // serialize's config struct
    type SerializeConfig= {
        requireAllSignatures?: boolean;
        verifySignatures?: boolean;
    }

    // serialize's config
    const serializeConfig: SerializeConfig = {
        requireAllSignatures: false,
    }

    // serialize transaction
    const base64Transaction = transaction.serialize(serializeConfig).toString('base64');
    
    // server's url
    const serverUrl = 'http://localhost:8080/transaction';

    // send transaction to server
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: base64Transaction }),
    });

    // take the response
    if (response.ok) {
      console.log(response, 'Transaction signature sent to server.');
    } else {
      console.error('Error:', response.statusText);
    }

    // convert response to transaction signature
    const transactionSignature = await response.json();
    console.log('transactionSignature', transactionSignature.message);

    // return transaction signature
    return transactionSignature.message;
};

