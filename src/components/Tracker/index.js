//Core
import React, { Component } from 'react';

//Styles
import './index.scss';

//Instruments
//eslint-disable-next-line
import { _validateAddress, _validateUser } from './instruments/logging';
import {gameRunning, gameLaunched, _getRunningGameInfo, _onGameInfoUpdated} from './instruments/OWListeners';

export default class Tracker extends Component {

    componentDidMount = () => {
        _getRunningGameInfo();
        _onGameInfoUpdated();
    }

    state = {
        logged: false,

        //values
        address: '',
        secret: '',
    };

    _handleInputChange = (e) => {
        const { name, value } = e.target;

        this.setState({
            [name]: value,
        });
    };

    _handleLogging = async (e) => {
        e.preventDefault();
        const { logged, address, secret } = this.state;

        //checking logged state
        if (logged) {
            console.log('logging out');
        } else {
            //if not logged - validating fields
            if (!address || !secret) {
                alert('Fill in all the fields, please!');
                return null;
            }

            //actual logging function
            const result = await _validateAddress(address, secret);

            if (!result.success || !result.verified) {
                alert('Verification not passed');
                return null;
            }
        }

        this.setState((prevState) => ({
            logged: !prevState.logged,
        }));
    };

    render() {
        const { logged } = this.state;

        return (
            <div id="container">
                {logged ? (
                    <h3>Buff Tracking in Progress</h3>
                ) : (
                    <h3>Buff Achievement Tracker</h3>
                )}
                {logged ? (
                    <h4>You can start playing your favorite game!</h4>
                ) : (
                    <h4>Welcome to Buff Achievement Tracker</h4>
                )}
                <div>
                    {logged ? null : (
                        <div>
                            <p>
                                In order to get started you have to sign events
                                transactions with your credentials.
                            </p>
                            <p>
                                You received it via email after registration in
                                buff.app
                            </p>
                        </div>
                    )}
                    <div>
                        {logged ? null : (
                            <form onSubmit={this._handleLogging}>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Put here your address"
                                    onChange={this._handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="secret"
                                    placeholder="Put here your secret"
                                    onChange={this._handleInputChange}
                                />
                                <input type="submit" hidden />
                            </form>
                        )}
                        {logged ? (
                            <button onClick={this._handleLogging}>
                                Logout or Change User
                            </button>
                        ) : (
                            <button onClick={this._handleLogging}>Apply</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
