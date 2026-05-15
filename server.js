require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set Globals for EJS
app.locals.API_BASE_URL = API_BASE_URL;

// Set Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const RESIDENCE_ID = 'residence-1';

// Helpers
const fetchFromApi = async (endpoint) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`API Error [GET ${endpoint}]:`, error.message);
        return null;
    }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Index
app.get('/', (req, res) => {
    res.render('login', { title: 'Login - Résidence Harmonie' });
});

// Manager Dashboard
app.get('/manager', async (req, res) => {
    const data = await fetchFromApi(`/residences/${RESIDENCE_ID}/manager/dashboard`);
    res.render('manager', { 
        title: 'Manager Dashboard',
        page: 'manager',
        data: data || {}
    });
});

// Employee Portal
app.get('/employee', async (req, res) => {
    const residentId = req.query.residentId;
    const period = req.query.period || 'Morning'; // Default to Morning
    const residents = await fetchFromApi(`/residences/${RESIDENCE_ID}/residents`);
    let tasks = [];
    let selectedResident = null;

    if (residents && residents.length > 0) {
        const idToFind = residentId || residents[0].id;
        selectedResident = residents.find(r => String(r.id) === String(idToFind)) || residents[0];
        
        // Fetch tasks and filter by period
        const allTasks = await fetchFromApi(`/residences/${RESIDENCE_ID}/residents/${selectedResident.id}/tasks`) || [];
        tasks = allTasks.filter(t => t.period.toLowerCase() === period.toLowerCase());
        
        console.log(`[SSR] Rendering /employee for resident: ${selectedResident.name}, period: ${period}`);
    }

    res.render('employee', { 
        title: 'Employee Portal',
        page: 'employee',
        residents: residents || [],
        selectedResident,
        tasks: tasks || [],
        currentPeriod: period
    });
});

// Admin / Settings
app.get('/admin', async (req, res) => {
    const data = await fetchFromApi(`/residences/${RESIDENCE_ID}/admin/dashboard`);
    res.render('admin', { 
        title: 'System Settings',
        page: 'admin',
        data: data || {}
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `--------------------------------------------------`);
    console.log(`\x1b[36m%s\x1b[0m`, `Résidence Harmonie WebApp Server Running`);
    console.log(`\x1b[33m%s\x1b[0m`, `Local URL:   http://localhost:${PORT}`);
    console.log(`\x1b[33m%s\x1b[0m`, `API Target:  ${API_BASE_URL}`);
    console.log(`\x1b[36m%s\x1b[0m`, `--------------------------------------------------`);
});
