const axios = require('axios');

const API_URL = 'https://house-rental-qa1z.onrender.com/api/auth/login';
const credentials = {
    email: 'owner@gmail.com',
    password: 'owner123'
};

async function testLogin() {
    console.log(`Attempting to login to ${API_URL}...`);
    try {
        const response = await axios.post(API_URL, credentials);
        console.log('Login Successful!');
        console.log('Status:', response.status);
        console.log('User Role:', response.data.user.role);
        console.log('Token received:', !!response.data.token);
    } catch (error) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
