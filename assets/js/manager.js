/**
 * manager.js — Résidence Harmonie
 * Populates the Manager Dashboard:
 *  - 5 KPI stat boxes
 *  - Tasks by Period (column bar chart)
 *  - Completion Rate by Employee (donut chart)
 *  - Tasks by Resident Top 5 (horizontal bar chart)
 *  - Pending Tasks table
 *  - Recent Observations table (critical rows highlighted red)
 *  - Quick Reports shortcuts
 *
 * All HTTP calls are delegated to ApiService.
 * ApexCharts is used identically to the original React implementation.
 */

$(function () {
    'use strict';

    // ─── Fallback data (matches React implementation constants) ───────────────

    var FALLBACK_KPI = {
        activeResidents: 24,
        tasksCompleted:  156,
        completionRate:  92,
        pendingTasks:    12,
        refusedTasks:    3,
        observationsToday: 8
    };

    var FALLBACK_BY_PERIOD = [
        { period: 'Morning',     rate: 85 },
        { period: 'Mid-Morning', rate: 90 },
        { period: 'Lunch',       rate: 78 },
        { period: 'Afternoon',   rate: 88 },
        { period: 'Dinner',      rate: 92 },
        { period: 'Evening',     rate: 95 }
    ];

    var FALLBACK_BY_RESIDENT = [
        { name: 'Jean Dupuis',      completed: 6, total: 6 },
        { name: 'Lucie Tremblay',   completed: 5, total: 6 },
        { name: 'Robert Gagnon',    completed: 4, total: 6 },
        { name: 'Monique Rousseau', completed: 3, total: 6 },
        { name: 'Pierre Martin',    completed: 6, total: 6 }
    ];

    var FALLBACK_PENDING = [
        { resident: 'Monique R. (302)', task: 'Douche',   period: 'Morning',   dueTime: '10:00 AM' },
        { resident: 'Lucie T. (205)',   task: 'Diner',    period: 'Lunch',     dueTime: '12:00 PM' },
        { resident: 'Robert G. (102)',  task: 'Exercice', period: 'Afternoon', dueTime: '2:00 PM'  }
    ];

    var FALLBACK_OBSERVATIONS = [
        { resident: 'Jean D. (201)',   text: 'Bon appétit au déjeuner', time: '9:15 AM',  status: 'normal'   },
        { resident: 'Robert G. (102)', text: 'Refus de la douche',       time: '8:45 AM',  status: 'critical' },
        { resident: 'Lucie T. (205)',  text: 'Fatigue signalée',         time: '10:30 AM', status: 'normal'   }
    ];

    var FALLBACK_REPORTS = [
        { name: 'Daily Report',        subtitle: '— By Resident' },
        { name: 'Employee Report',     subtitle: '— Today'       },
        { name: 'Refusals Report',     subtitle: '— This Week'   },
        { name: 'Monthly Performance', subtitle: '— This Month'  }
    ];

    // ─── Chart instances (kept so we can destroy/re-create on data change) ────
    var periodChart     = null;
    var completionChart = null;
    var residentChart   = null;

    // ─── Bootstrap ────────────────────────────────────────────────────────────

    ApiService.getManagerDashboard(
        function (data) { renderDashboard(data); },
        function ()     { renderDashboard({}); }   // on error — use full fallback
    );

    // ─── Master render ────────────────────────────────────────────────────────

    function renderDashboard(data) {
        // Merge API data with fallback, field-by-field
        var kpi = $.extend({}, FALLBACK_KPI, data.kpis || {});
        kpi.observations = kpi.observationsToday || kpi.observations || FALLBACK_KPI.observationsToday;

        var byPeriod   = _normaliseByPeriod((data.charts   || {}).tasksByPeriod   || FALLBACK_BY_PERIOD);
        var byResident = _normaliseByResident((data.charts || {}).tasksByResident  || FALLBACK_BY_RESIDENT);
        var pending    = (data.tables || {}).pendingTasks       || FALLBACK_PENDING;
        var obsRows    = (data.tables || {}).recentObservations || FALLBACK_OBSERVATIONS;
        var reports    = data.quickReports || FALLBACK_REPORTS;

        renderKPIs(kpi);
        renderPeriodChart(byPeriod);
        renderCompletionDonut(kpi);
        renderResidentChart(byResident);
        renderPendingTable(pending);
        renderObservationsTable(obsRows);
        renderQuickReports(reports);
    }

    // ─── Data normalisers (handle both API key variants) ─────────────────────

    function _normaliseByPeriod(list) {
        return $.map(list, function (p) {
            return { period: p.period, rate: p.rate || p.completionRate || 0 };
        });
    }

    function _normaliseByResident(list) {
        return $.map(list, function (r) {
            return {
                name:  r.name || r.resident,
                done:  r.completed || r.done || 0,
                total: r.total || 6
            };
        });
    }

    // ─── KPI boxes ───────────────────────────────────────────────────────────

    function renderKPIs(kpi) {
        $('#kpi-residents').text(kpi.activeResidents);
        $('#kpi-completed').text(kpi.tasksCompleted);
        $('#kpi-pending').text(kpi.pendingTasks);
        $('#kpi-refused').text(kpi.refusedTasks);
        $('#kpi-observations').text(kpi.observations);
        // Update sub-text completion rate dynamically
        $('#kpi-completed-sub').text(kpi.completionRate + '% completion rate');
    }

    // ─── Tasks by Period — column bar ─────────────────────────────────────────

    function renderPeriodChart(byPeriod) {
        var categories = $.map(byPeriod, function (p) { return p.period; });
        var values     = $.map(byPeriod, function (p) { return p.rate; });

        var options = {
            chart: {
                type:       'bar',
                height:     220,
                toolbar:    { show: false },
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: ['#3b82f6'],
            plotOptions: {
                bar: { columnWidth: '50%', borderRadius: 4 }
            },
            dataLabels: {
                enabled:   true,
                formatter: function (val) { return val + '%'; },
                style:     { fontSize: '11px', fontWeight: 700 }
            },
            series: [{ name: 'Completion Rate', data: values }],
            xaxis: {
                categories: categories,
                labels: { style: { colors: '#9ca3af', fontSize: '10px' } },
                axisBorder: { show: false },
                axisTicks:  { show: false }
            },
            yaxis: {
                max: 100,
                labels: { style: { colors: '#9ca3af' } }
            },
            grid: {
                show: true,
                borderColor:   '#374151',
                strokeDashArray: 4,
                yaxis: { lines: { show: true } },
                xaxis: { lines: { show: false } }
            },
            theme: { mode: $('body').hasClass('dark-mode') ? 'dark' : 'light' }
        };

        if (periodChart) { periodChart.destroy(); }
        periodChart = new ApexCharts(document.getElementById('chart-tasks-period'), options);
        periodChart.render();
    }

    // ─── Completion Rate — donut ──────────────────────────────────────────────

    function renderCompletionDonut(kpi) {
        var options = {
            chart: {
                type:       'donut',
                height:     200,
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: ['#12b76a', '#f79009', '#f04438'],
            labels: ['Completed', 'Pending', 'Refused'],
            series: [kpi.tasksCompleted, kpi.pendingTasks, kpi.refusedTasks],
            stroke:      { show: false },
            dataLabels:  { enabled: false },
            legend:      { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show:      true,
                                label:     'Completion',
                                formatter: function () { return kpi.completionRate + '%'; },
                                color:     '#10b981',
                                fontSize:  '20px',
                                fontWeight: 800
                            }
                        }
                    }
                }
            },
            theme: { mode: $('body').hasClass('dark-mode') ? 'dark' : 'light' }
        };

        if (completionChart) { completionChart.destroy(); }
        completionChart = new ApexCharts(document.getElementById('chart-completion'), options);
        completionChart.render();

        // Populate manual legend
        $('#donut-legend').html(
            '<div class="d-flex align-items-center gap-2 mb-2"><span class="rounded-circle d-inline-block" style="width:10px;height:10px;background:#12b76a"></span>' +
            '<span class="fs-12 fw-600 text-rh-muted">Completed (' + kpi.tasksCompleted + ')</span></div>' +
            '<div class="d-flex align-items-center gap-2 mb-2"><span class="rounded-circle d-inline-block" style="width:10px;height:10px;background:#f79009"></span>' +
            '<span class="fs-12 fw-600 text-rh-muted">Pending (' + kpi.pendingTasks + ')</span></div>' +
            '<div class="d-flex align-items-center gap-2"><span class="rounded-circle d-inline-block" style="width:10px;height:10px;background:#f04438"></span>' +
            '<span class="fs-12 fw-600 text-rh-muted">Refused (' + kpi.refusedTasks + ')</span></div>'
        );
    }

    // ─── Tasks by Resident — horizontal bar ───────────────────────────────────

    function renderResidentChart(byResident) {
        var COLORS  = ['#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#10b981'];

        // Capture byResident in closure for the dataLabels formatter
        var _data = byResident;

        var options = {
            chart: {
                type:       'bar',
                height:     220,
                toolbar:    { show: false },
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: COLORS,
            plotOptions: {
                bar: {
                    horizontal:  true,
                    barHeight:   '55%',
                    distributed: true,
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled:    true,
                textAnchor: 'start',
                formatter:  function (val, opts) {
                    var item = _data[opts.dataPointIndex];
                    return item ? item.done + '/' + item.total : '';
                },
                style: { fontSize: '12px', fontWeight: 700, colors: ['#fff'] }
            },
            series: [{
                name: 'Done',
                data: $.map(byResident, function (r) {
                    return { x: r.name, y: r.done };
                })
            }],
            xaxis: {
                type:   'category',
                labels: { style: { colors: '#9ca3af' } },
                axisBorder: { show: false },
                axisTicks:  { show: false }
            },
            grid:   { show: false },
            legend: { show: false },
            theme:  { mode: $('body').hasClass('dark-mode') ? 'dark' : 'light' }
        };

        if (residentChart) { residentChart.destroy(); }
        residentChart = new ApexCharts(document.getElementById('chart-residents'), options);
        residentChart.render();
    }

    // ─── Pending Tasks table ──────────────────────────────────────────────────

    function renderPendingTable(rows) {
        var $tbody = $('#pending-tasks-body').empty();

        if (!rows || rows.length === 0) {
            $tbody.append(
                '<tr><td colspan="4" class="text-center text-muted py-4 fs-12">No pending tasks</td></tr>'
            );
            return;
        }

        $.each(rows, function (i, row) {
            $tbody.append(
                '<tr>' +
                  '<td class="fs-12 fw-bold">'  + _esc(row.resident) + '</td>' +
                  '<td class="fs-12 text-muted">' + _esc(row.task)     + '</td>' +
                  '<td class="fs-12 text-muted">' + _esc(row.period)   + '</td>' +
                  '<td class="fs-12 fw-bold text-rh-red text-nowrap">🕐 ' + _esc(row.dueTime) + '</td>' +
                '</tr>'
            );
        });
    }

    // ─── Recent Observations table ────────────────────────────────────────────

    function renderObservationsTable(rows) {
        var $tbody = $('#observations-body').empty();

        if (!rows || rows.length === 0) {
            $tbody.append(
                '<tr><td colspan="3" class="text-center text-muted py-4 fs-12">No observations</td></tr>'
            );
            return;
        }

        $.each(rows, function (i, row) {
            var isCritical = row.status === 'critical' || row.type === 'refusal';
            var rowClass   = isCritical ? 'row-critical' : '';
            $tbody.append(
                '<tr class="' + rowClass + '">' +
                  '<td class="fs-12 fw-bold">'  + _esc(row.resident) + '</td>' +
                  '<td class="fs-12">'           + _esc(row.text)     + '</td>' +
                  '<td class="fs-12">'           + _esc(row.time)     + '</td>' +
                '</tr>'
            );
        });
    }

    // ─── Quick Reports shortcuts ──────────────────────────────────────────────

    function renderQuickReports(reports) {
        var $container = $('#quick-reports-list').empty();

        $.each(reports, function (i, r) {
            var name     = r.name     || r.label    || '';
            var subtitle = r.subtitle || ('— ' + (r.sub || ''));
            $container.append(
                '<button class="quick-report-btn mb-2" type="button">' +
                  '<span class="quick-report-icon"><i class="fas fa-file-alt"></i></span>' +
                  '<span>' +
                    '<span class="quick-report-title">' + _esc(name)     + '</span>' +
                    '<span class="quick-report-sub">'   + _esc(subtitle) + '</span>' +
                  '</span>' +
                '</button>'
            );
        });
    }

    // ─── Utility: HTML escape ────────────────────────────────────────────────

    function _esc(str) {
        return $('<div>').text(str || '').html();
    }

});
