require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const CUSTOM_OBJECT = process.env.CUSTOM_OBJECT || 'video_games';
const PORT = process.env.PORT || 3000;

const axiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
});

/**
 * ROUTE 1 - GET "/" homepage
 * - Retrieves custom object records from HubSpot
 * - Renders views/homepage.pug with the items and properties
 */
// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (req, res) => {
    const properties = ['game_name', 'publisher', 'price']; 
    try {
        const resp = await axiosInstance.get(`/crm/v3/objects/${CUSTOM_OBJECT}`, {
            params: {
                properties: properties.join(','),
                limit: 100
        }
    });

    const items = resp.data.results || [];
    res.render('homepage', { title: 'Video Games List', items, properties });
    } catch (error) {
        console.error('Error fetching custom objects:', error.response ? error.response.data : error.message);
        // Render homepage with empty items and show error message
        res.render('homepage', { title: 'Video Games List', items: [], properties, error: error.response ? JSON.stringify(error.response.data) : error.message });
    }
});



/**
 * ROUTE 2 - GET "/update-cobj"
 * - Renders a form to create a new custom object record
 */
// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});


/**
 * ROUTE 3 - POST "/update-cobj"
 * - Receives form data and creates a new record in the custom object via HubSpot API
 * - Redirects back to homepage after success
 */
// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/update-cobj', async (req, res) => {
  // Collect values from the form. Names must match the inputs in updates.pug
    const payload = {
    properties: {
        game_name: req.body.game_name || '',
        publisher: req.body.publisher || '',
        price: req.body.price || ''
        }
    };

    try {
        await axiosInstance.post(`/crm/v3/objects/${CUSTOM_OBJECT}`, payload);
        return res.redirect('/');
    } catch (error) {
        console.error('Error creating record:', error.response ? error.response.data : error.message);
        // show an error message page OR redirect back with flash — for simplicity, show text
        return res.status(500).send('Error creating record: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
    });

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));