use anchor_lang::prelude::*;

declare_id!("EQmZEvaYxaVxQQCkpaXcgrqBVWE6ZkKZ2V3oHxL4he9X");

#[program]
pub mod evm_key_pair {
    use super::*;

    pub fn create(ctx: Context<CreateContext>) -> Result<()> {
        ctx.accounts.note.user = ctx.accounts.user.key();
        ctx.accounts.note.content = "123".to_string();
        Ok(())
    }

    pub fn edit(ctx: Context<EditContext>, content: String) -> Result<()> {
        ctx.accounts.note.content = content.clone();
        Ok(())
    }

    pub fn delete(ctx: Context<DeleteContext>) -> Result<()>{
        let note = &mut ctx.accounts.note;
        let user = &ctx.accounts.user;

        **user.to_account_info().try_borrow_mut_lamports()? += note.to_account_info().lamports();
        **note.to_account_info().try_borrow_mut_lamports()? = 0;

        let _ = note.close(user.to_account_info());

        Ok(())
    }

}

#[derive(Accounts)]
pub struct CreateContext<'info> {
    /// CHECK: The account that will be used to pay for the rent of the new account.
    pub rand: AccountInfo<'info>,
    #[account(init_if_needed, payer =renter, seeds=[b"note", rand.key().as_ref()], bump, space = 8 + 32 + 24)]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub renter: Signer<'info>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EditContext<'info> {
    #[account(mut, has_one=user)]
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

#[derive(Accounts)]
 pub struct Initialize {}

#[account]
#[derive(InitSpace)]
pub struct Note {
        // convert address and signature to Uint8Array
        // const ethAddress = hexToUint8Array(addr.slice(2), 20); length of the ethereum address is 44 bytes TDOO find this out
        // user: [u8,44], // change to ethereum pubkey
    user: Pubkey, // change to ethereum pubkey 
    #[max_len(20)]
    content: String,
}
