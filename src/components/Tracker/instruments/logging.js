export const _validateAddress = async (address, secret, callback) => {
    const response = await fetch(
        `http://52.15.131.50:4000/api/accounts/getPublicKey?address=${address}`,
        {
            method: 'GET',
            headers: {
                address,
            },
        },
    );

    const data = await response.json();
    // console.log(data);

    return _validateUser(data.publicKey, secret);
};

export const _validateUser = async (publicKey, passphrase) => {
    const response = await fetch(
        'http://52.15.131.50:4000/api/game-start/verify',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                publicKey,
                passphrase,
            }),
        },
    );

    const data = await response.json();
    return data;
};
