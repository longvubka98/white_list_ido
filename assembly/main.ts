import { Context, env, PersistentSet, storage } from 'near-sdk-as';
import { PostedMessage, messages, WhitelistContract, whitelistApply } from './model';
import { AccountId } from './types';

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;

// globals
let contract: WhitelistContract
let whitelist = new PersistentSet<AccountId>('w')

export function initContract(ownerAccountId: AccountId): WhitelistContract {
  /// Initializes the contract with the given NEAR foundation account ID.
  assert(!storage.hasKey('init'), 'Already initialized')
  assert(env.isValidAccountID(ownerAccountId), 'The owner account ID is invalid')
  contract = new WhitelistContract(ownerAccountId)
  storage.set('init', true)
  return contract
}

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addMessage(text: string): void {
  _isInit()
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
  _isInit()
  const numMessages = min(MESSAGE_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}

export function applyWhitelist(accountIds: AccountId[]): AccountId[] {
  _isInit()
  _assertCalledByOwner()

  let listWhitelistApplySuccess: AccountId[] = []

  for (let i = 0; i < accountIds.length; i++) {
    if (env.isValidAccountID(accountIds[i]))
      whitelistApply.add(accountIds[i])
    listWhitelistApplySuccess.push(accountIds[i])
  }

  return listWhitelistApplySuccess
}

export function getListWhitelistApply(): AccountId[] {
  _isInit()

  return whitelistApply.values()
}

export function randomWhiteList(numberOfWhitelists: number): AccountId[] {
  _isInit()
  _assertCalledByOwner()
  assert(storage.hasKey('randomWhiteList') && storage.getSome<bool>('randomWhiteList') == true, 'You can only random whitelist once .')
  storage.set('randomWhiteList', true)

  if (whitelistApply.size <= numberOfWhitelists)
    whitelist = whitelistApply
  else {
    whitelistApply.values()
  }
}

function _isInit(): void {
  assert(storage.hasKey('init') && storage.getSome<bool>('init') == true, 'The contract should be initialized before usage.')
}

function _assertCalledByOwner(): void {
  assert(Context.predecessor == contract.ownerAccountId, 'Can only be called by owner')
}

function _shuffle(array: Array<any>): string[] {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    if (array[currentIndex] !== undefined && array[randomIndex] !== undefined)
      [array[currentIndex][Symbol.iterator], array[randomIndex][Symbol.iterator]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}