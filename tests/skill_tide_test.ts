import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create profile",
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
    
    const profile = chain.callReadOnlyFn(
      'skill-tide',
      'get-profile',
      [types.principal(wallet1.address)],
      wallet1.address
    );
    
    profile.result.expectOk().expectSome();
  }
});

Clarinet.test({
  name: "Can post and retrieve offering",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'post-offering',
        [types.ascii("JavaScript Tutoring"),
         types.ascii("Teaching modern JS concepts"),
         types.uint(3)],
        wallet1.address
      )
    ]);
    
    const offeringId = block.receipts[0].result.expectOk().expectUint(1);
    
    const offering = chain.callReadOnlyFn(
      'skill-tide',
      'get-offering',
      [types.uint(offeringId)],
      wallet1.address
    );
    
    offering.result.expectOk().expectSome();
  }
});

Clarinet.test({
  name: "Can schedule and complete meetup",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Post offering
    let block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'post-offering',
        [types.ascii("JavaScript Tutoring"),
         types.ascii("Teaching modern JS concepts"),
         types.uint(3)],
        wallet1.address
      )
    ]);
    
    const offeringId = block.receipts[0].result.expectOk().expectUint(1);
    
    // Schedule meetup
    block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'schedule-meetup',
        [types.uint(offeringId),
         types.principal(wallet2.address),
         types.uint(1677628800)],
        wallet1.address
      )
    ]);
    
    const meetupId = block.receipts[0].result.expectOk().expectUint(1);
    
    // Complete meetup
    block = chain.mineBlock([
      Tx.contractCall('skill-tide', 'complete-meetup',
        [types.uint(meetupId)],
        wallet1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    const meetup = chain.callReadOnlyFn(
      'skill-tide',
      'get-meetup',
      [types.uint(meetupId)],
      wallet1.address
    );
    
    const meetupData = meetup.result.expectOk().expectSome();
    assertEquals(meetupData['status'], "completed");
  }
});
