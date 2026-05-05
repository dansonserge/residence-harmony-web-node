/**
 * admin.js — Résidence Harmonie
 * Populates the Admin / Settings page:
 *  - General Settings form (residence name, address, language, logo upload)
 *  - Reference Data list (periods, shifts, priorities, frequencies)
 *  - Task Catalog table (name, category, duration, priority badge)
 *  - User Management table (avatar initials, role badge, status badge, edit button)
 *
 * All HTTP calls go through ApiService.
 */

$(function () {
    'use strict';

    // ─── Init ─────────────────────────────────────────────────────────────────

    showLoader(true);
    hideError();

    ApiService.getAdminDashboard(
        function (data) {
            renderGeneralSettings(data.generalSettings || {});
            renderReferenceData(data);
            renderTaskCatalog(data.catalogItems || []);
            renderUserTable(data.users || []);
            showLoader(false);
        },
        function (err) {
            showLoader(false);
            showError('Failed to load configuration: ' + err);
        }
    );

    // ─── General Settings form ────────────────────────────────────────────────

    function renderGeneralSettings(gs) {
        $('#input-residence-name').val(gs.residenceName || '');
        $('#input-address').val(gs.address || '');
        $('#select-language').val(gs.language || 'Français');
    }

    $('#btn-save-settings').on('click', function () {
        // Collect form values — wire real PATCH when backend supports it
        var payload = {
            residenceName: $('#input-residence-name').val(),
            address:       $('#input-address').val(),
            language:      $('#select-language').val()
        };
        console.info('Save Settings (mock):', payload);
        // Visual feedback
        var $btn = $(this);
        $btn.text('Saved ✓').prop('disabled', true);
        setTimeout(function () { $btn.text('Save Settings').prop('disabled', false); }, 2000);
    });

    // ─── Reference Data ───────────────────────────────────────────────────────

    function renderReferenceData(data) {
        var items = [
            { label: 'Periods of Day', count: data.periodsCount    || 0, colorClass: 'bg-primary' },
            { label: 'Work Shifts',    count: data.shiftsCount     || 0, colorClass: 'bg-purple'  },
            { label: 'Priorities',     count: data.prioritiesCount || 0, colorClass: 'bg-warning text-dark' },
            { label: 'Frequencies',    count: data.frequenciesCount|| 0, colorClass: 'bg-success' }
        ];

        var $list = $('#ref-data-list').empty();

        $.each(items, function (i, item) {
            $list.append(
                '<div class="d-flex justify-content-between align-items-center py-3 px-4 border-bottom">' +
                  '<div>' +
                    '<p class="mb-0 fw-500 fs-13" style="color:var(--rh-text)">' + _esc(item.label) + '</p>' +
                    '<p class="mb-0 mt-1 fs-11 text-rh-muted">' +
                      '<span class="badge ' + item.colorClass + ' me-1">' + item.count + '</span>configured' +
                    '</p>' +
                  '</div>' +
                  '<button class="btn btn-sm btn-outline-secondary rounded-3 fs-11" type="button">Manage</button>' +
                '</div>'
            );
        });
    }

    // ─── Task Catalog table ───────────────────────────────────────────────────

    function renderTaskCatalog(items) {
        var $tbody = $('#catalog-body').empty();

        if (items.length === 0) {
            $tbody.append('<tr><td colspan="4" class="text-center text-muted py-4 fs-12">No catalog items</td></tr>');
            return;
        }

        $.each(items, function (i, item) {
            $tbody.append(
                '<tr>' +
                  '<td class="fs-13 fw-500" style="color:var(--rh-text)">' + _esc(item.name)     + '</td>' +
                  '<td class="fs-13 text-rh-muted">'                         + _esc(item.category) + '</td>' +
                  '<td class="fs-13 text-rh-muted">'                         + _esc(item.duration) + '</td>' +
                  '<td>' + _priorityBadge(item.priority)                                            + '</td>' +
                '</tr>'
            );
        });
    }

    // ─── User Management table ────────────────────────────────────────────────

    function renderUserTable(users) {
        var $tbody = $('#users-body').empty();

        if (users.length === 0) {
            $tbody.append('<tr><td colspan="4" class="text-center text-muted py-4 fs-12">No users</td></tr>');
            return;
        }

        $.each(users, function (i, user) {
            var initials = user.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase();
            $tbody.append(
                '<tr>' +
                  '<td>' +
                    '<div class="d-flex align-items-center gap-2">' +
                      '<span class="user-initials-avatar">' + _esc(initials) + '</span>' +
                      '<span class="fs-13 fw-500" style="color:var(--rh-text)">' + _esc(user.name) + '</span>' +
                    '</div>' +
                  '</td>' +
                  '<td>' + _roleBadge(user.role)                                               + '</td>' +
                  '<td><span class="badge badge-done">● ' + _esc(user.status) + '</span></td>' +
                  '<td>' +
                    '<button class="btn btn-sm btn-outline-primary rounded-3 fs-11" type="button">✏ Edit</button>' +
                  '</td>' +
                '</tr>'
            );
        });
    }

    // ─── Badge helpers ────────────────────────────────────────────────────────

    function _priorityBadge(priority) {
        if (priority === 'Haute')   return '<span class="badge badge-haute">● Haute</span>';
        if (priority === 'Moyenne') return '<span class="badge badge-moyenne">● Moyenne</span>';
        return '<span class="badge badge-na">' + _esc(priority) + '</span>';
    }

    function _roleBadge(role) {
        if (role === 'Admin')   return '<span class="badge bg-primary">'  + _esc(role) + '</span>';
        if (role === 'Manager') return '<span class="badge bg-info">'     + _esc(role) + '</span>';
        return '<span class="badge badge-na">' + _esc(role) + '</span>';
    }

    // ─── UI state helpers ─────────────────────────────────────────────────────

    function showLoader(show) {
        $('#page-loader').toggleClass('d-none', !show);
        $('#page-main').toggleClass('d-none', show);
    }

    function showError(msg) {
        $('#page-error').text(msg).removeClass('d-none');
    }

    function hideError() {
        $('#page-error').addClass('d-none');
    }

    // ─── Logo upload (visual only) ────────────────────────────────────────────

    $('#logo-upload-btn').on('click', function () {
        $('#logo-file-input').trigger('click');
    });

    $('#logo-file-input').on('change', function () {
        var file = this.files[0];
        if (file) {
            $('#logo-upload-label').text('📎 ' + file.name);
        }
    });

    // ─── Utility ─────────────────────────────────────────────────────────────

    function _esc(str) {
        return $('<div>').text(str || '').html();
    }

});
