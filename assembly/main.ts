import { Context, env, PersistentSet, storage, math, base64, ContractPromiseBatch, u128 } from 'near-sdk-as';
import { PostedMessage, messages } from './model';
import { AccountId } from './types';

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;
let START_SALE_BLOCK = <u64>85524707;
let END_SALE_BLOCK = <u64>85624707;
const TOKEN_PRICE = 5000; // 1 near = ? s_tokens, fixed price
const MAX_SPEND_PER_BUYER = 10 // maximum near BUY amount per account
const AMOUNT = 5000000; // the amount of presale tokens up for presale

// globals
let ownerAccountId = 'dragonvu.testnet'

let whitelist = new PersistentSet<AccountId>('w')
const whitelistApply = new PersistentSet<AccountId>('wa')

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addMessage(text: string): void {
  assert(env.isValidAccountID(ownerAccountId), 'The given account ID is invalid')
  // Creating a new message and populating fields with our data
  const message = new PostedMessage(text);
  // Adding the message to end of the persistent collection
  messages.push(message);
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getMessages(): PostedMessage[] {
  const numMessages = min(MESSAGE_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}

export function tranferOnwer(accountId: AccountId): bool {
  _assertCalledByOwner()

  assert(env.isValidAccountID(accountId), 'The given account ID is invalid')
  ownerAccountId = accountId
  return true
}

export function isOwner(accountId: AccountId): bool {
  return ownerAccountId == accountId
}

export function updateStartBlock(number: u64): bool {
  _assertCalledByOwner()
  _assertBeforeSaleStart()

  if (number > env.block_index()) {
    START_SALE_BLOCK = number
    return true
  }

  return false
}

export function updateEndBlock(number: u64): bool {
  _assertCalledByOwner()
  _assertBeforeSaleStart()

  if (number > START_SALE_BLOCK) {
    END_SALE_BLOCK = number
    return true
  }

  return false
}

export function applyWhitelist(accountIds: AccountId[]): AccountId[] {

  _assertBeforeSaleStart()

  let listWhitelistApplySuccess: AccountId[] = []

  for (let i = 0; i < accountIds.length; i++) {
    if (env.isValidAccountID(accountIds[i]))
      whitelistApply.add(accountIds[i])
    listWhitelistApplySuccess.push(accountIds[i])
  }

  return listWhitelistApplySuccess
}

export function getListWhitelistApply(): AccountId[] {
  return whitelistApply.values()
}

export function isWhitelistApplied(accountId: AccountId): bool {
  return whitelistApply.has(accountId)
}

export function randomWhitelist(numberOfWhitelists: i32): AccountId[] {
  _assertCalledByOwner()
  assert(storage.hasKey('randomWhiteList') && storage.getSome<bool>('randomWhiteList') == true, 'You can only random whitelist once .')
  storage.set('randomWhiteList', true)

  if (whitelistApply.size <= numberOfWhitelists)
    whitelist = whitelistApply
  else {
    let whitelistApplyValues = whitelistApply.values()
    shuffleArray(whitelistApplyValues)
    const randomWhitelist = whitelistApplyValues.slice(0, numberOfWhitelists)
    for (let i = 0; i < randomWhitelist.length; i++) {
      whitelist.add(randomWhitelist[i])
    }
  }
  return whitelist.values()
}

export function addWhitelist(accountIds: AccountId[]): AccountId[] {
  _assertCalledByOwner()
  _assertBeforeSaleStart()

  let listWhitelistAddSuccess: AccountId[] = []

  for (let i = 0; i < accountIds.length; i++) {
    if (env.isValidAccountID(accountIds[i]) && !whitelist.has(accountIds[i])) {
      whitelist.add(accountIds[i])
      listWhitelistAddSuccess.push(accountIds[i])
    }
  }

  return listWhitelistAddSuccess
}

export function removeWhitelist(accountIds: AccountId[]): AccountId[] {
  _assertCalledByOwner()
  _assertBeforeSaleStart()

  let listWhitelistRemoveSuccess: AccountId[] = []

  for (let i = 0; i < accountIds.length; i++) {
    if (env.isValidAccountID(accountIds[i]) && whitelist.has(accountIds[i])) {
      whitelist.delete(accountIds[i])
      listWhitelistRemoveSuccess.push(accountIds[i])
    }
  }

  return listWhitelistRemoveSuccess
}

export function getListWhitelist(): AccountId[] {
  return whitelist.values()
}

export function isWhitelisted(accountId: AccountId): bool {
  return whitelist.has(accountId)
}

export function buyToken(amount: u128): bool {

  _assertAfterSaleStart()
  _assertBeforSaleEnd()

  assert(amount <= u128.from(MAX_SPEND_PER_BUYER), 'alo')
  const contractAccount = "dragonvu.testnet";
  let promise = ContractPromiseBatch.create(Context.sender);
  promise.then(contractAccount).transfer(amount)
  return true
}

function _assertCalledByOwner(): void {
  assert(Context.predecessor == ownerAccountId, 'Can only be called by owner')
}

function _assertBeforeSaleStart(): void {
  assert(env.block_index() < START_SALE_BLOCK, 'The sale has been started ')
}

function _assertAfterSaleStart(): void {
  assert(env.block_index() > START_SALE_BLOCK, 'The sale has not started ')
}

function _assertBeforSaleEnd(): void {
  assert(env.block_index() < END_SALE_BLOCK, 'The sale has been ended ')
}

export function random(): string {
  return base64.encode(math.randomSeed())
}

function shuffleArray(array: AccountId[]): void {
  // for (var i = array.length - 1; i > 0; i--) {
  //   var j = <i32>JSMath.floor(JSMath.random() * (i + 1));
  //   var temp = array[i];
  //   array[i] = array[j];
  //   array[j] = temp;
  // }
}
