const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create a pool of database connections
const pool = mysql.createPool({
    host: 'bxejia2anbusgyh8pwrb-mysql.services.clever-cloud.com',
    user: 'ukpa0gskslhl5nnk',
    password: 'BsnIEVCm9xCl9tVg0t9g',
    database: 'bxejia2anbusgyh8pwrb',
    connectionLimit: 10
});

// Simulated storage for user voting status
const userVotes = {};

app.post('/ussd', (req, res) => {
    const {
        
        sessionId,
        serviceCode,
        phoneNumber,
        text,
    } = req.body;

    let response = '';

    if (!userVotes[phoneNumber]) {
        userVotes[phoneNumber] = {
            voted: false,
            language: null,
            candidate: null,
        };
    }

    if (userVotes[phoneNumber].voted) {
        response = 'END You have already voted. Thank you!';
    } else {
        if (text === '') {
            response = `CON Hitamo Ururimi 
            1. KIN
            2. ENG`;
        } else if (text === '1') {
            userVotes[phoneNumber].language = 'KIN';
            response = `CON Hitamo Umukandida Wahisemo?
            1. PAUL KAGAME
            2. FRANK HABINEZA
            3. BARAFINDA`;
        } else if (text === '2') {
            userVotes[phoneNumber].language = 'ENG';
            response = `CON Choose your candidate?
            1. PAUL KAGAME
            2. FRANK HABINEZA
            3. BARAFINDA`;
        } else if (['1*1', '1*2', '1*3', '2*1', '2*2', '2*3'].includes(text)) {
            const candidateID = text.split('*')[1];
            userVotes[phoneNumber].candidate = candidateID;

            let candidateName = '';
            switch(candidateID) {
                case '1':
                    candidateName = 'PAUL KAGAME';
                    break;
                case '2':
                    candidateName = 'FRANK HABINEZA';
                    break;
                case '3':
                    candidateName = 'BARAFINDA';
                    break;
            }

            response = userVotes[phoneNumber].language === 'KIN' ? 
                `CON WAHISEMO ${candidateName}. EMEZA UGUKORA
                1. Yego
                2. Oya` : 
                `CON You selected ${candidateName}. Confirm your vote
                1. Yes
                2. No`;
        } else if (['1*1*1', '1*2*1', '1*3*1', '2*1*1', '2*2*1', '2*3*1'].includes(text)) {
            userVotes[phoneNumber].voted = true;
            const candidateID = text.split('*')[1];
            let candidateName = '';
            switch(candidateID) {
                case '1':
                    candidateName = 'PAUL KAGAME';
                    break;
                case '2':
                    candidateName = 'FRANK HABINEZA';
                    break;
                case '3':
                    candidateName = 'BARAFINDA';
                    break;
            }
            const sql = 'INSERT INTO votes (phoneNumber, candidateID, candidateName) VALUES (?, ?, ?)';
            pool.query(sql, [phoneNumber, candidateID, candidateName], (err, results) => {
                if (err) {
                    console.error('Error inserting vote:', err);
                    response = 'END There was an error processing your vote. Please try again later.';
                } else {
                    response = userVotes[phoneNumber].language === 'KIN' ? 
                        'END WAHISEMO UMUKANDIDA. MURAKOZE!' : 
                        'END You have voted. Thank you!';
                }
                res.set('Content-Type', 'text/plain');
                res.send(response);
            });
            return;
        } else if (['1*1*2', '1*2*2', '1*3*2', '2*1*2', '2*2*2', '2*3*2'].includes(text)) {
            response = userVotes[phoneNumber].language === 'KIN' ? 
                'END MWABAYE MWANZE GUTORA. MURAKOZE!' : 
                'END You have canceled your vote. Thank you!';
        } else if (text.toLowerCase() === 'check') {
            const sql = 'SELECT candidateID FROM votes WHERE phoneNumber = ?';
            pool.query(sql, [phoneNumber], (err, results) => {
                if (err) {
                    console.error('Error checking vote:', err);
                    response = 'END There was an error checking your vote. Please try again later.';
                } else if (results.length === 0) {
                    response = 'END You have not voted yet.';
                } else {
                    let candidateName = '';
                    switch(results[0].candidateID) {
                        case '1':
                            candidateName = 'PAUL KAGAME';
                            break;
                        case '2':
                            candidateName = 'FRANK HABINEZA';
                            break;
                        case '3':
                            candidateName = 'BARAFINDA';
                            break;
                    }
                    response = `END You have voted for ${candidateName}.`;
                }
                res.set('Content-Type', 'text/plain');
                res.send(response);
            });
            return;
        } else {
            response = userVotes[phoneNumber].language === 'KIN' ? 
                'END IBYO WAHISEMO SIBYO. MWONGERE MUGERAGEZE.' : 
                'END Invalid option. Please try again.';
        }
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
