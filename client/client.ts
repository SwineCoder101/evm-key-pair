import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import type { EvmKeyPair } from "../target/types/evm_key_pair";

anchor.setProvider(anchor.AnchorProvider.env());

// (alias) module "solana-playground"
// export namespace pg

const program = anchor.workspace.HelloAnchor as anchor.Program<EvmKeyPair>;

//create wallet
const wallet = anchor.Wallet.local();

// Client
console.log("My address:", program.provider.publicKey.toString());
const balance = await program.provider.connection.getBalance(program.provider.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

const rand = anchor.web3.Keypair.generate();
console.log("0");
const [noteAccount, bump] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("note"), rand.publicKey.toBytes()],
    program.programId
);
console.log("1 ", noteAccount.toBase58());
const txn = await program.methods
    .create()
    .accounts({
        rand: rand.publicKey,
        user: program.provider.publicKey,
        renter: program.provider.publicKey,
    })
    .add({
        note: noteAccount,
    })
    .add({
        systemProgram: web3.SystemProgram.programId,
    })
    .signers([wallet.payer])
    .rpc();
console.log("3");
//const note = await program.account.note.fetch(noteAccount);
//await program.provider.connection.getAccountInfo(noteAccount);
//console.log('create: ',note);

const txn2 = await program.methods
  .edit("hello world!")
  .accounts({
    user: program.provider.publicKey,
    renter: program.provider.publicKey,
    note: noteAccount,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([wallet.payer])
  .rpc();

//const note2 = await program.provider.connection.getAccountInfo(noteAccount);
//console.log(note2);
const note2 = await program.account.note.fetch(noteAccount);
console.log("edit: ", note2);

const search = "hello";

const accounts = await program.provider.connection.getProgramAccounts(program.programId, {
  dataSlice: { offset: 0, length: 64 },
  filters: [
    {
      memcmp: {
        offset: 13,
        bytes: bs58.encode(Buffer.from(search)),
      },
    },
  ],
});


