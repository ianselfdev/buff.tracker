export const _sendStartGameTrs = async (tx) => {
    const response = await fetch('http://52.15.131.50:4000/api/game-start', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            tx,
        },
    });

    console.log('SEND START GAME TX');

    const result = await response.json();
    console.log(result);
};

export const _sendEndGameTrs = async (tx) => {
    const response = await fetch('http://52.15.131.50:4000/api/game-end', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            tx,
        },
    });

    console.log('SEND END GAME TX');

    const result = await response.json();
    console.log(result);
};

export const _changeState = async (state) => {
    const response = await fetch('http://52.15.131.50:4000/api/state', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            state,
        },
    });

    const result = await response.json();
    console.log(result);
};
