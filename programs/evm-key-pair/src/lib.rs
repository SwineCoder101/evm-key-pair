use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    secp256k1_program::ID as SECP256K1_PROGRAM_ID,
    instruction::{AccountMeta, Instruction},
};

declare_id!("EQmZEvaYxaVxQQCkpaXcgrqBVWE6ZkKZ2V3oHxL4he9X");

#[program]
pub mod evm_key_pair {
    use anchor_lang::solana_program::{entrypoint::ProgramResult, program::invoke};

    use super::*;

    pub fn invoke_secp256k1(ctx: Context<InvokeSecp256k1>) -> ProgramResult {
        // Prepare the secp256k1 instruction data here
        let secp256k1_instruction_data: Vec<u8> = vec![]; // Replace with actual data

        // Create the CPI instruction
        let ix = Instruction {
            program_id: SECP256K1_PROGRAM_ID,
            accounts: vec![
                AccountMeta::new(ctx.accounts.secp256k1_program.key(), false),
            ],
            data: secp256k1_instruction_data,
        };

        // Invoke the secp256k1 program
        invoke(
            &ix,
            &[ctx.accounts.secp256k1_program.clone()],
        )?;

        Ok(())
    }

    pub fn create(ctx: Context<CreateContext>) -> Result<()> {
        ctx.accounts.note.user = ctx.accounts.user.key();
        ctx.accounts.note.content = "123".to_string();
        Ok(())
    }

    pub fn edit(ctx: Context<EditContext>, content: String) -> Result<()> {
        ctx.accounts.note.content = content.clone();
        Ok(())
    }

    pub fn delete(ctx: Context<DeleteContext>) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let user = &ctx.accounts.user;

        **user.to_account_info().try_borrow_mut_lamports()? += note.to_account_info().lamports();
        **note.to_account_info().try_borrow_mut_lamports()? = 0;

        let _ = note.close(user.to_account_info());

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InvokeSecp256k1<'info> {
    /// CHECK: This is the secp256k1 program ID
    pub secp256k1_program: AccountInfo<'info>,
    /// CHECK: This is the user account that signs the transaction
    #[account(signer)]
    pub user: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateContext<'info> {
    /// CHECK: The account that will be used to pay for the rent of the new account.
    pub rand: AccountInfo<'info>,
    #[account(init_if_needed, payer = renter, seeds=[b"note", rand.key().as_ref()], bump, space = 8 + 32 + 24)]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub renter: Signer<'info>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EditContext<'info> {
    #[account(mut, has_one = user)]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteContext<'info> {
    #[account(mut, has_one = user, close = user)]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Note {
    user: Pubkey, // change to ethereum pubkey
    #[max_len(20)]
    content: String,
}
