import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

export default function WhiteList({ onSubmit, currentUser, contract }) {

    const [isWhitelistApplied, setIsWhitelistApplied] = useState(false)
    const [isWhitelisted, setIsWhitelisted] = useState(false)
    const [isOwner, setIsOwner] = useState(false)

    useEffect(() => {
        try {
            contract.isWhitelistApplied({
                accountId: currentUser.accountId,
                BOATLOAD_OF_GAS
            }).then(setIsWhitelistApplied)

            // contract.isWhitelisted({
            //     accountId: currentUser.accountId,
            //     BOATLOAD_OF_GAS
            // }).then(setIsWhitelisted)

            // contract.isOwner({
            //     accountId: currentUser.accountId,
            //     BOATLOAD_OF_GAS
            // }).then(setIsOwner)
        } catch (error) {
            console.log('error', error)
        }
    }, [])

    console.log('isWhitelistApplied', isWhitelistApplied)

    const applyWhitelist = () => {
        contract.applyWhitelist([currentUser.accountId]).then(data => {
            console.log('data', data)
        })
    }
    return (
        <div>
            <h4>Hello {currentUser.accountId} !</h4>
            <p>{isWhitelistApplied ? 'You have applied to whitelist' : 'Please press the button to apply to the whitelist'}</p>
            <button onClick={applyWhitelist}>Apply</button>
        </div>
    )

}

WhiteList.propTypes = {
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
        removeWhitelist: PropTypes.func.removeWhitelist,
    }).isRequired,
    currentUser: PropTypes.shape({
        accountId: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired
    })
}