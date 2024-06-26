import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EvmKeyPair } from "../target/types/evm_key_pair";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import bs58 from "bs58";

import * as borsh from '@coral-xyz/borsh';

export const NoteAccountSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.publicKey('user'),
  borsh.str('content'),
]);

describe("evm-key-pair", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EvmKeyPair as Program<EvmKeyPair>;

  const signer = anchor.workspace.EvmKeyPair.provider.wallet.payer as anchor.web3.Keypair;


  const createNote = async () => {
    const rand = anchor.web3.Keypair.generate();

    const [noteAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("note"), rand.publicKey.toBytes()],
      program.programId
  );

  const accounts = {
    rand: rand.publicKey,
    user: signer.publicKey,
    renter: signer.publicKey,
    system_program: anchor.web3.SystemProgram.programId,
    note: noteAccount,
  }

  const tx = await program.methods.create().accounts(accounts).signers([signer]).rpc(); //change to transaction
  console.log("Your transaction signature", tx);
  return noteAccount;
  }

  const editNote = async (noteAccount: PublicKey, inputNote: string) => {
    const account = {
      user: signer.publicKey,
      note: noteAccount,
      system_program: anchor.web3.SystemProgram.programId,
    }
    const tx = await program.methods.edit(inputNote).accounts(account).signers([signer]).rpc();
    console.log("Your transaction signature", tx);

  }

  const deleteNote = async (noteAccount: PublicKey) => {
    const account = {
      user: signer.publicKey,
      note: noteAccount,
    }

    const tx = await program.methods.delete().accounts(account).signers([signer]).rpc();
    console.log("Your transaction signature", tx);
  }


  it ("can create note", async () => {
    // Create a new note.
    const noteAccount1=await createNote();
    const noteAccount2 = await createNote();

    await editNote(noteAccount1,"note 1"); 
    await editNote(noteAccount2,"note 2"); 

    await deleteNote(noteAccount2);

    // find the note
    const foundAccounts = await program.provider.connection.getProgramAccounts(program.programId, {
      dataSlice: { offset: 0, length: 64 },
      filters: [
        {
          memcmp: {
            offset: 8,
            bytes: bs58.encode(signer.publicKey.toBuffer()),
          },
        },
      ],
    });
    console.log("found accounts", foundAccounts);
    foundAccounts.forEach((account) => {
      const note = NoteAccountSchema.decode(account.account.data);
      console.log("note", note);
    });
  });
});
