require('dotenv').config();
const mongoose = require('mongoose');
const { connectMediaDB } = require('./config/mediaDatabase');

async function test() {
    try {
        console.log('Testing Media DB Connection...');
        const conn = await connectMediaDB();
        console.log('Media DB State:', conn.readyState);
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

test();
