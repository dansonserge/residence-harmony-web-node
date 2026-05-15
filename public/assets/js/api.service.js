/**
 * api.service.js — Résidence Harmonie
 * Modernized Fetch-based API layer.
 * Using Vanilla JS (No jQuery dependencies).
 */

const ApiService = (function () {
    'use strict';

    // Use injected ENV or fallback to current host
    const API_BASE = (window.ENV && window.ENV.API_BASE) || '';
    const RESIDENCE_ID = 'residence-1';

    /**
     * Internal helper — wraps fetch with consistent error handling.
     */
    async function _request(method, url, payload = null) {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json'
            }
        };

        if (payload) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(payload);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP Error ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`ApiService Error [${method} ${url}]:`, error.message);
            throw error;
        }
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    return {
        /**
         * GET /residences/:id/manager/dashboard
         */
        getManagerDashboard: function (cb, errCb) {
            const url = `${API_BASE}/residences/${RESIDENCE_ID}/manager/dashboard`;
            _request('GET', url)
                .then(data => cb && cb(data))
                .catch(err => errCb && errCb(err.message));
        },

        /**
         * GET /residences/:id/residents
         */
        getResidents: function (cb, errCb) {
            const url = `${API_BASE}/residences/${RESIDENCE_ID}/residents`;
            _request('GET', url)
                .then(data => cb && cb(data))
                .catch(err => errCb && errCb(err.message));
        },

        /**
         * GET /residences/:id/residents/:residentId/tasks
         */
        getResidentTasks: function (residentId, cb, errCb) {
            const url = `${API_BASE}/residences/${RESIDENCE_ID}/residents/${residentId}/tasks`;
            _request('GET', url)
                .then(data => cb && cb(data))
                .catch(err => errCb && errCb(err.message));
        },

        /**
         * GET /residences/:id/admin/dashboard
         */
        getAdminDashboard: function (cb, errCb) {
            const url = `${API_BASE}/residences/${RESIDENCE_ID}/admin/dashboard`;
            _request('GET', url)
                .then(data => cb && cb(data))
                .catch(err => errCb && errCb(err.message));
        }
    };

}());
