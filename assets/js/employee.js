/**
 * employee.js — Résidence Harmonie
 * Manages the employee task view:
 *  - Left panel: resident list with avatar, badges, task counter
 *  - Right panel: selected resident header + 6 fixed period tabs + task cards
 *  - Each task card: status action buttons (Done / In Progress / Refused / N/A),
 *    observation textarea, inline status badge
 *  - Empty state when a period tab has no tasks
 *  - Summary bar: Done / Pending / Refused counts
 *
 * All HTTP calls go through ApiService.
 */

$(function () {
    'use strict';

    // ─── Constants ────────────────────────────────────────────────────────────

    var PERIODS = ['Morning', 'Mid-Morning', 'Lunch', 'Afternoon', 'Dinner', 'Evening'];

    var AVATAR_COLORS = [
        { bg: '#dbeafe', text: '#1e40af' },
        { bg: '#dcfce7', text: '#15803d' },
        { bg: '#fef3c7', text: '#92400e' },
        { bg: '#f3e8ff', text: '#7e22ce' },
        { bg: '#fee2e2', text: '#991b1b' }
    ];

    // ─── State ────────────────────────────────────────────────────────────────

    var currentResident  = null;
    var allTasks         = [];
    var taskStatuses     = {};   // { taskId: 'Done' | 'In Progress' | 'Refused' | 'N/A' | 'Pending' }
    var taskObservations = {};   // { taskId: string }
    var activeTab        = 'Morning';
    var allResidents     = [];

    // ─── Init: load resident list ─────────────────────────────────────────────

    showResidentLoading(true);

    ApiService.getResidents(
        function (residents) {
            allResidents = residents || [];
            renderResidentList(allResidents);
            $('#resident-count').text('(' + allResidents.length + ')');
            showResidentLoading(false);
            if (allResidents.length > 0) {
                selectResident(allResidents[0]);
            }
        },
        function () {
            showResidentLoading(false);
            $('#resident-list').html('<p class="text-center text-muted py-4 fs-12">Failed to load residents.</p>');
        }
    );

    // ─── Resident click ───────────────────────────────────────────────────────

    $(document).on('click', '.resident-item', function () {
        var id       = $(this).data('id');
        var resident = _findResident(id);
        if (resident) selectResident(resident);
    });

    function selectResident(resident) {
        currentResident  = resident;
        allTasks         = [];
        taskStatuses     = {};
        taskObservations = {};
        activeTab        = 'Morning';

        // Highlight selected item
        $('.resident-item').removeClass('active');
        $('.resident-item[data-id="' + resident.id + '"]').addClass('active');

        // Show right panel, populate header
        $('#task-panel').removeClass('d-none');
        $('#no-resident-msg').addClass('d-none');
        renderResidentHeader(resident);

        // Load tasks
        showTaskLoading(true);
        $('#task-list-wrapper').empty();

        ApiService.getResidentTasks(
            resident.id,
            function (tasks) {
                allTasks = tasks || [];
                $.each(allTasks, function (i, t) {
                    taskStatuses[t.id]     = t.status || 'Pending';
                    taskObservations[t.id] = t.observation || '';
                });
                showTaskLoading(false);
                // Reveal task-panel sections
                $('#task-header, #period-tabs-wrapper, #summary-bar').removeClass('d-none');
                $('#no-resident-msg').addClass('d-none');
                renderPeriodTabs();
                renderTasks();
            },
            function () {
                showTaskLoading(false);
                $('#task-list-wrapper').html('<p class="text-center text-muted py-4 fs-12">Failed to load tasks.</p>');
            }
        );
    }

    // ─── Period tab click ─────────────────────────────────────────────────────

    $(document).on('click', '.period-tab', function () {
        activeTab = $(this).data('period');
        renderPeriodTabs();
        renderTasks();
    });

    // ─── Task status button click ─────────────────────────────────────────────

    $(document).on('click', '.btn-task-status', function () {
        var $card  = $(this).closest('.task-card');
        var taskId = $card.data('task-id');
        var status = $(this).data('status');
        taskStatuses[taskId] = status;
        refreshTaskCard($card, taskId, _findTask(taskId));
        updateSummaryBar();
    });

    // ─── Observation textarea ─────────────────────────────────────────────────

    $(document).on('input', '.task-observation', function () {
        var taskId = $(this).closest('.task-card').data('task-id');
        taskObservations[taskId] = $(this).val();
    });

    // ─── Render: resident list ────────────────────────────────────────────────

    function renderResidentList(residents) {
        var $list = $('#resident-list').empty();

        if (residents.length === 0) {
            $list.html('<p class="text-center text-muted py-4 fs-12">No residents found.</p>');
            return;
        }

        $.each(residents, function (i, r) {
            var initials = r.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase();
            var colors   = AVATAR_COLORS[i % AVATAR_COLORS.length];

            // Avatar: try photoUrl, fall back to initials
            var avatarHtml = '<img class="resident-avatar" src="' + _esc(r.photoUrl) + '" alt="' + _esc(r.name) + '" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                '<span class="notif-avatar-initials" style="display:none;background:' + colors.bg + ';color:' + colors.text + ';width:40px;height:40px">' + initials + '</span>';

            // Badges
            var badges = '';
            badges += '<span class="badge-rh bg-light-blue me-1">' + r.doneTasksCount + '/' + r.totalTasksCount + ' done</span>';
            
            if (r.alerts.allergies && r.alerts.allergies.length > 0) {
                badges += '<span class="badge-rh bg-light-orange me-1">' + _esc(r.alerts.allergies[0]) + '</span>';
                if (r.alerts.allergies.length > 1) {
                    badges += '<span class="badge-rh bg-light-orange me-1">' + _esc(r.alerts.allergies[1]) + '</span>';
                }
            }
            
            if (r.alerts.risk === 'Fall' || r.alerts.risk === 'High') {
                badges += '<span class="badge-rh bg-light-red me-1">Fall Risk</span>';
            }
            
            if (r.alerts.mobility && r.alerts.mobility !== 'Independent') {
                badges += '<span class="badge-rh bg-light-gray me-1">' + _esc(r.alerts.mobility) + '</span>';
            }

            var $item = $('<button>')
                .addClass('resident-item')
                .attr('data-id', r.id)
                .attr('type', 'button')
                .data('id', r.id)
                .html(
                    '<span class="position-relative">' + avatarHtml + '</span>' +
                    '<span class="flex-1 text-start" style="min-width:0">' +
                      '<div class="d-flex justify-content-between align-items-center mb-1">' +
                        '<span class="resident-name">' + _esc(r.name) + '</span>' +
                        '<span class="resident-room" style="font-size:10px">Room ' + _esc(r.roomNumber) + '</span>' +
                      '</div>' +
                      '<div class="d-flex flex-wrap gap-1">' + badges + '</div>' +
                    '</span>'
                );

            $list.append($item);
        });
    }

    // ─── Render: resident header ──────────────────────────────────────────────

    function renderResidentHeader(resident) {
        $('#resident-title').html('<i class="fas fa-user-circle me-2 text-muted"></i>' + resident.name + ' — Room ' + resident.roomNumber);

        var badges = '';
        badges += '<span class="badge-rh bg-light-blue me-2">🍽 Texture: ' + _esc(resident.alerts.texture) + '</span>';
        $.each(resident.alerts.allergies || [], function (i, a) {
            badges += '<span class="badge-rh bg-light-orange me-2">⚠ Allergies: ' + _esc(a) + '</span>';
        });
        badges += '<span class="badge-rh bg-light-blue me-2">♿ Mobility: ' + _esc(resident.alerts.mobility) + '</span>';
        if (resident.alerts.risk === 'Fall' || resident.alerts.risk === 'High') {
            badges += '<span class="badge-rh bg-light-orange me-2">⚡ Risk: Fall</span>';
        }

        $('#resident-alerts').html(badges);
    }

    // ─── Render: period tabs ──────────────────────────────────────────────────

    function renderPeriodTabs() {
        var $nav = $('#period-tabs-nav').empty();
        $.each(PERIODS, function (i, period) {
            var isActive = period === activeTab;
            $nav.append(
                '<button class="nav-link period-tab ' + (isActive ? 'active' : '') + '" ' +
                'data-period="' + period + '" type="button">' + period + '</button>'
            );
        });
    }

    // ─── Render: task list for active tab ────────────────────────────────────

    function renderTasks() {
        var $wrapper  = $('#task-list-wrapper').empty();
        var filtered  = $.grep(allTasks, function (t) { return t.period === activeTab; });
        var $heading  = $('#period-heading').text('Accompagnements du ' + activeTab);

        if (filtered.length === 0) {
            $wrapper.html(
                '<div class="empty-state">' +
                  '<div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>' +
                  '<p class="fs-13 fw-500 text-muted mb-0">No tasks for ' + activeTab + '</p>' +
                  '<p class="fs-11 text-muted">This period has no scheduled tasks for this resident.</p>' +
                '</div>'
            );
        } else {
            $.each(filtered, function (i, task) {
                $wrapper.append(buildTaskCard(task));
            });
        }

        updateSummaryBar();
    }

    // ─── Build a task card ────────────────────────────────────────────────────

    function buildTaskCard(task) {
        var status      = taskStatuses[task.id] || task.status || 'Pending';
        var observation = taskObservations[task.id] || '';
        var priorityEmoji = task.priority === 'Haute' ? '🟡' : '📋';
        var priorityClass = task.priority === 'Haute'   ? 'text-rh-red'
                          : task.priority === 'Moyenne' ? 'text-rh-yellow'
                          : 'text-rh-muted';

        var statusBadge = _statusBadge(status);

        var $card = $('<div>')
            .addClass('task-card')
            .attr('data-task-id', task.id);

        $card.html(
            '<div class="d-flex align-items-start justify-content-between gap-3 mb-3">' +
              '<div>' +
                '<p class="fs-14 fw-700 mb-1" style="color:var(--rh-text)">' +
                  priorityEmoji + ' ' + _esc(task.name) +
                  '<span class="fw-500 text-muted ms-2 fs-12">/ ' + _esc((task.description || '').split(' ')[0]) + '</span>' +
                '</p>' +
                '<div class="d-flex align-items-center gap-3 fs-11 text-muted">' +
                  '<span><i class="far fa-clock me-1"></i> Durée: ' + _esc(task.duration) + '</span>' +
                  '<span class="' + priorityClass + '"><i class="fas fa-circle me-1" style="font-size:6px"></i> ' + _esc(task.priority) + ' priorité</span>' +
                '</div>' +
              '</div>' +
              '<div class="flex-shrink-0">' + statusBadge + '</div>' +
            '</div>' +

            '<div class="observation-box">' +
               '<textarea class="task-observation" rows="2" ' +
                 'placeholder="Observation: (optionnelle)...">' + _esc(observation) + '</textarea>' +
            '</div>' +

            '<div class="d-flex flex-wrap gap-2 mt-3">' +
              _statusBtn('Done',        'btn-task-status' + (status === 'Done'        ? ' active-done'     : ''), '✓ Done') +
              _statusBtn('In Progress', 'btn-task-status' + (status === 'In Progress' ? ' active-progress' : ''), '▶ ' + (status === 'In Progress' ? 'In Progress' : 'Start')) +
              _statusBtn('Refused',     'btn-task-status' + (status === 'Refused'     ? ' active-refused'  : ''), '✗ Refused') +
              _statusBtn('N/A',         'btn-task-status' + (status === 'N/A'         ? ' active-na'       : ''), 'N/A') +
            '</div>'
        );

        return $card;
    }

    // Refresh a single card's buttons + badge after status change
    function refreshTaskCard($card, taskId, task) {
        if (!task) return;
        var $new = buildTaskCard(task);
        // Preserve observation textarea value
        $new.find('.task-observation').val(taskObservations[taskId] || '');
        $card.replaceWith($new);
    }

    // ─── Summary bar ─────────────────────────────────────────────────────────

    function updateSummaryBar() {
        var done    = 0;
        var pending = 0;
        var refused = 0;

        $.each(taskStatuses, function (id, s) {
            if (s === 'Done')                          done++;
            else if (s === 'In Progress' || s === 'Pending') pending++;
            else if (s === 'Refused')                  refused++;
        });

        $('#summary-done').text(done);
        $('#summary-pending').text(pending);
        $('#summary-refused').text(refused);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function _findResident(id) {
        var found = null;
        $.each(allResidents, function (i, r) {
            if (String(r.id) === String(id)) { found = r; return false; }
        });
        return found;
    }

    function _findTask(id) {
        var found = null;
        $.each(allTasks, function (i, t) {
            if (String(t.id) === String(id)) { found = t; return false; }
        });
        return found;
    }

    function _statusBadge(status) {
        if (status === 'Done')        return '<span class="badge badge-done">✓ Done</span>';
        if (status === 'In Progress') return '<span class="badge badge-progress">⟳ In Progress</span>';
        if (status === 'Refused')     return '<span class="badge badge-refused">✗ Refused</span>';
        if (status === 'N/A')         return '<span class="badge badge-na">N/A</span>';
        return '<span class="badge badge-pending">⏳ Pending</span>';
    }

    function _statusBtn(status, extraClass, label) {
        return '<button type="button" class="btn-task-status ' + extraClass + '" data-status="' + status + '">' + label + '</button>';
    }

    function _esc(str) {
        return $('<div>').text(str || '').html();
    }

    function showResidentLoading(show) {
        if (show) {
            $('#resident-list').html('<div class="loading-overlay"><div class="rh-spinner"></div></div>');
        }
    }

    function showTaskLoading(show) {
        if (show) {
            $('#task-list-wrapper').html('<div class="loading-overlay"><div class="rh-spinner"></div><span>Loading tasks…</span></div>');
        }
    }

});
