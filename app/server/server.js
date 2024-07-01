const web3 =  require('@solana/web3.js');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

// Middleware để parse request body dạng JSON
app.use(express.json());
app.use(cors());

// Hàm xử lý transaction
const sendTransaction = async(base64Transaction) => {
    const transactionBuffer = Buffer.from(base64Transaction, 'base64');
    const transaction = web3.Transaction.from(transactionBuffer);
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    
    const keypair = web3.Keypair.fromSecretKey(
        Uint8Array.from([13,82,117,67,249,64,150,31,116,67,234,152,255,109,62,111,35,170,11,56,65,18,157,242,80,97,246,84,1,65,149,181,67,249,215,33,158,135,96,152,226,28,89,211,255,248,42,118,35,1,14,106,86,195,183,2,96,13,139,199,238,239,157,74])
      );
    
    const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash();

    console.log('Pubkey: ', keypair.publicKey);

    transaction.lastValidBlockHeight = lastValidBlockHeight;
    // In Solana want to multiply sign need use partialSign
    transaction.partialSign(keypair);

    console.log('Transaction', transaction);

    const serialized = transaction.serialize({
      requireAllSignatures: true,
      verifySignatures: true,
    });

    const signature = await connection.sendEncodedTransaction(serialized.toString('base64'), 
    {
      maxRetries: 5,
      skipPreflight: true,
    });
    
    console.log('Sent transaction', signature);

    await connection.confirmTransaction(signature, 'confirmed');
    console.log('Confirmed transaction', signature);

    return signature;
}

// API endpoint để nhận transaction dưới dạng base64
app.post('/transaction', async (req, res) => {
  const base64Transaction = req.body.transaction;

  if (!base64Transaction) {
    res.status(400).send({error: 'Missing transaction'});
    return;
  }

  // Gọi hàm do_something để xử lý transaction
  const signature = await sendTransaction(base64Transaction);

  res.status(200).send({message: signature});
});

// Khởi động máy chủ
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
