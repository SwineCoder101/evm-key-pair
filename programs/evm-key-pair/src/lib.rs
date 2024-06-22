use anchor_lang::prelude::*;

declare_id!("EQmZEvaYxaVxQQCkpaXcgrqBVWE6ZkKZ2V3oHxL4he9X");

#[program]
pub mod evm_key_pair {
    use super::*;

    pub fn create(ctx: Context<CreateContext>) -> Result<()> {
        // create a file
        ctx.accounts.note.user = ctx.accounts.user.key();
        ctx.accounts.note.content = "123".to_string();
        Ok(())
    }

    pub fn edit(ctx: Context<EditContext>, content: String) -> Result<()> {
        ctx.accounts.note.content = content.clone();
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
    pub renter: Signer<'info>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
 pub struct Initialize {}

#[account]
#[derive(InitSpace)]
pub struct Note {
    user: Pubkey,
    #[max_len(20)]
    content: String,
}
