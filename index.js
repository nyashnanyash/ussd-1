const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/ussd', (req, res) => {
    // Read the variables sent via POST from our API
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = '';

    if (text === '') {
        // This is the first request. Note how we start the response with CON
        response = `CON Welcome to the Election Portal\n`;
        response += `Select your preferred language:\n`;
        response += `1. English\n`;
        response += `2. Kinyarwanda`;
    } else if (text === '1' || text === '2') {
        // Save user's language choice and move to the main menu
        const language = text === '1' ? 'English' : 'Kinyarwanda';
        response = `CON Language selected: ${language}\n`;
        response += `Choose an option:\n`;
        response += `1. Register\n`;
        response += `2. Vote\n`;
        response += `3. View Information\n`;
        response += `4. View My Vote`;
    } else if (text === '1*1') {
        // Register option selected
        response = `END Registration feature is currently not available.`;
    } else if (text === '1*2') {
        // Vote option selected
        response = `CON Select a candidate:\n`;
        response += `1. Raymond IGABINEZA\n`;
        response += `2. Florence UMUTONIWASE\n`;
        response += `3. Jean Paul KWIBUKA\n`;
        response += `4. Gaella UWAYO\n`;
        response += `5. Danny HABIMANA`;
    } else if (text === '1*3') {
        // View Information option selected
        response = `END View Information feature is currently not available.`;
    } else if (text === '1*4') {
        // View My Vote option selected
        response = `END View My Vote feature is currently not available.`;
    } else if (text === '1*2*1' || text === '1*2*2' || text === '1*2*3' || text === '1*2*4' || text === '1*2*5') {
        // Voting confirmation
        const candidateIndex = parseInt(text.split('*')[3]) - 1;
        const candidates = [
            'Raymond IGABINEZA',
            'Florence UMUTONIWASE',
            'Jean Paul KWIBUKA',
            'Gaella UWAYO',
            'Danny HABIMANA'
        ];
        if (candidateIndex >= 0 && candidateIndex < candidates.length) {
            response = `END Thank you for voting for ${candidates[candidateIndex]}!`;
        } else {
            response = `END Invalid selection. Please try again.`;
        }
    } else {
        // Invalid input
        response = `END Invalid input. Please try again.`;
    }

    // Send the response back to the API
    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server listening on port:", PORT));
