/**
 * api.service.js — Résidence Harmonie
 * Centralised AJAX layer. All HTTP calls go through this object.
 * Pages must never call $.ajax directly.
 *
 * API base: http://localhost:3001
 */

var API_BASE     = 'http://localhost:3001';
var RESIDENCE_ID = 'residence-1';

var ApiService = (function () {
    'use strict';

    /**
     * Internal helper — wraps $.ajax with consistent error handling.
     * @param {string}   method  HTTP verb
     * @param {string}   url     Full URL
     * @param {*}        payload Request body (for POST/PATCH/PUT)
     * @param {Function} cb      Success callback (data)
     * @param {Function} errCb   Error callback (message string) — optional
     */
    function _request(method, url, payload, cb, errCb) {
        var opts = {
            url:      url,
            method:   method,
            dataType: 'json',
            success: function (data) {
                cb(data);
            },
            error: function (xhr, status, err) {
                var msg = 'Request failed [' + method + ' ' + url + ']: ' + (err || status);
                console.error(msg, xhr);
                if (typeof errCb === 'function') {
                    errCb(msg);
                }
            }
        };

        if (payload !== null) {
            opts.contentType = 'application/json';
            opts.data = JSON.stringify(payload);
        }

        $.ajax(opts);
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    return {

        /**
         * GET /residences/:id/manager/dashboard
         * Returns KPIs, chart data, tables, and quick reports.
         */
        getManagerDashboard: function (cb, errCb) {
            _request(
                'GET',
                API_BASE + '/residences/' + RESIDENCE_ID + '/manager/dashboard',
                null, cb, errCb
            );
        },

        /**
         * GET /residences/:id/residents
         * Returns the full list of residents with alerts and task counters.
         */
        getResidents: function (cb, errCb) {
            _request(
                'GET',
                API_BASE + '/residences/' + RESIDENCE_ID + '/residents',
                null, cb, errCb
            );
        },

        /**
         * GET /residences/:id/residents/:residentId/tasks
         * Returns all tasks for a given resident, including period and status.
         */
        getResidentTasks: function (residentId, cb, errCb) {
            _request(
                'GET',
                API_BASE + '/residences/' + RESIDENCE_ID + '/residents/' + residentId + '/tasks',
                null, cb, errCb
            );
        },

        /**
         * GET /residences/:id/admin/dashboard
         * Returns general settings, reference data counts, catalog items, users.
         */
        getAdminDashboard: function (cb, errCb) {
            _request(
                'GET',
                API_BASE + '/residences/' + RESIDENCE_ID + '/admin/dashboard',
                null, cb, errCb
            );
        }

    };

}());
