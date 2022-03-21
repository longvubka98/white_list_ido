import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import { utils } from 'near-api-js';

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

export default function Owner({ onSubmit, currentUser, contract }) {

    const [listWhitelistApply, setListWhitelistApply] = useState([])
    const [listWhitelisted, setListWhitelised] = useState([])

    const [accountIdRemove, setAccountIdRemove] = useState('')
    const [accountIdAddWhitelist, setAccountIdAddWhitelist] = useState('')
    const [buyAmount, setBuyAmount] = useState(0)

    useEffect(() => {
        try {

            contract.getListWhitelistApply().then(setListWhitelistApply)
            contract.getListWhitelist().then(setListWhitelised)
        } catch (error) {
            console.log('error', error)
        }
    }, [])


    const applyWhitelist = () => {
        contract.random({ number: 10 }).then(data => {
            console.log('data', data)
        })
    }

    const getBlockIndex = () => {
        contract.getBlockIndex().then(data => console.log('data', data))
    }

    const addWhitelist = () => {
        contract.addWhitelist({
            accountIds: [accountIdAddWhitelist]
        }).then(data => { })
    }

    const removeWhitelist = () => {
        contract.removeWhitelist({
            accountIds: [accountIdRemove]
        }).then(data => { })
    }

    const deposit = () => {
        console.log('first', buyAmount, Big(buyAmount).div(10 ** 24))
        contract.buyToken({
            amount: utils.format.parseNearAmount(buyAmount)
        }).then(data => console.log('data', data))
    }

    return (
        <div>
            <h4>Hello boss {currentUser.accountId} !</h4>
            <h4>List apply to whitelist</h4>
            {listWhitelistApply.map(item => <p>{item}</p>)}
            <p>Random list whitelist</p>
            <button onClick={getBlockIndex}>Random</button>
            <h4>List whitelisted</h4>
            {listWhitelisted.length == 0 && <p>Not yet</p>}
            {listWhitelisted.map((item, index) => <p key={index.toString()}>{item}</p>)}
            <p>Number of whitelisted: {listWhitelisted.length}</p>

            <p>Add account id to whitelist</p>
            <p className="highlight">
                <label htmlFor="message">AccountId:</label>
                <input
                    value={accountIdAddWhitelist}
                    autoComplete="off"
                    id="addWhitelist"
                    onChange={evt => setAccountIdAddWhitelist(evt.target.value)}
                />
            </p>
            <button onClick={addWhitelist}>
                Add
            </button>
            <p>Remove account id from whitelist</p>
            <p className="highlight">
                <label htmlFor="message">AccountId:</label>
                <input
                    autoComplete="off"
                    value={accountIdRemove}
                    id="removeWhitelist"
                    onChange={evt => setAccountIdRemove(evt.target.value)}
                />
            </p>
            <button onClick={removeWhitelist}>
                Remove
            </button>
            <p>Buy token</p>
            <p>
                <label htmlFor="donation">Amonut:</label>
                <input
                    autoComplete="off"
                    value={buyAmount}
                    id="buyAmount"
                    max={Big(currentUser.balance).div(10 ** 24)}
                    min="0"
                    step="0.01"
                    type="number"
                    onChange={evt => setBuyAmount(evt.target.value)}
                />
                <span title="NEAR Tokens">Ⓝ</span>
            </p>
            <button onClick={deposit}>
                Deposit
            </button>
        </div>
    )

}

Owner.propTypes = {
    contract: PropTypes.shape({
        addMessage: PropTypes.func.isRequired,
        getMessages: PropTypes.func.isRequired,
        getListWhitelistApply: PropTypes.func.isRequired,
        getListWhitelist: PropTypes.func.isRequired,
        isWhitelistApplied: PropTypes.func.isRequired,
        isWhitelisted: PropTypes.func.isRequired,
        isOwner: PropTypes.func.isRequired,
        applyWhitelist: PropTypes.func.isRequired,
        randomWhitelist: PropTypes.func.isRequired,
        addWhitelist: PropTypes.func.isRequired,
        removeWhitelist: PropTypes.func.isRequired,
        random: PropTypes.func.isRequired,
        buyToken: PropTypes.func.isRequired,
    }).isRequired,
    currentUser: PropTypes.shape({
        accountId: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired
    })
}