import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create profile with valid coordinates",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'create-profile',
        [types.ascii("Web Development"),
         types.ascii("Brooklyn, NY"),
         types.uint(40712),
         types.uint(74006)],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Cannot create profile with invalid coordinates",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'create-profile',
        [types.ascii("Web Development"),
         types.ascii("Invalid"),
         types.uint(95000000), // Invalid latitude
         types.uint(74006)],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectErr(104); // err-invalid-coordinates
  }
});

Clarinet.test({
  name: "Cannot create duplicate profile",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'create-profile',
        [types.ascii("Web Development"),
         types.ascii("Brooklyn, NY"),
         types.uint(40712),
         types.uint(74006)],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'create-profile',
        [types.ascii("Another Skill"),
         types.ascii("New York, NY"),
         types.uint(40712),
         types.uint(74006)],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectErr(103); // err-already-exists
  }
});

// [Rest of the original tests remain unchanged]
