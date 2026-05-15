/**
 * manager.js — Résidence Harmonie
 * Cleaned version: No jQuery data loading for tables/reports.
 * Handles only the initialization of ApexCharts and light UI logic.
 */

$(function () {
    'use strict';

    // ─── Chart instances ────
    var periodChart     = null;
    var completionChart = null;
    var residentChart   = null;

    // ─── Bootstrap ────────────────────────────────────────────────────────────
    
    // Data is provided by EJS via window.CHART_DATA and window.KPI_DATA
    if (window.CHART_DATA && window.KPI_DATA) {
        renderCharts(window.CHART_DATA, window.KPI_DATA);
    }

    function renderCharts(charts, kpis) {
        renderPeriodChart(charts.tasksByPeriod || []);
        renderCompletionDonut(kpis);
        renderResidentChart(charts.tasksByResident || []);
    }

    // ─── Tasks by Period — column bar ─────────────────────────────────────────

    function renderPeriodChart(byPeriod) {
        var categories = byPeriod.map(p => p.period);
        var values     = byPeriod.map(p => p.rate);

        var options = {
            chart: {
                type: 'bar',
                height: 220,
                toolbar: { show: false },
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: ['#3b82f6'],
            plotOptions: {
                bar: { columnWidth: '50%', borderRadius: 4 }
            },
            dataLabels: {
                enabled: true,
                formatter: val => val + '%',
                style: { fontSize: '11px', fontWeight: 700 }
            },
            series: [{ name: 'Completion Rate', data: values }],
            xaxis: {
                categories: categories,
                labels: { style: { colors: '#9ca3af', fontSize: '10px' } }
            },
            yaxis: { max: 100, labels: { style: { colors: '#9ca3af' } } },
            grid: { borderColor: '#374151', strokeDashArray: 4 },
            theme: { mode: $('body').hasClass('dark-mode') ? 'dark' : 'light' }
        };

        if (periodChart) periodChart.destroy();
        periodChart = new ApexCharts(document.getElementById('chart-tasks-period'), options);
        periodChart.render();
    }

    // ─── Completion Rate — donut ──────────────────────────────────────────────

    function renderCompletionDonut(kpi) {
        var options = {
            chart: {
                type: 'donut',
                height: 200,
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: ['#12b76a', '#f79009', '#f04438'],
            labels: ['Completed', 'Pending', 'Refused'],
            series: [kpi.tasksCompleted, kpi.pendingTasks, kpi.refusedTasks],
            stroke: { show: false },
            legend: { show: false },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: { fontSize: '13px', fontWeight: 700 },
                            value: { fontSize: '24px', fontWeight: 800, formatter: () => kpi.completionRate + '%' },
                            total: { show: true, label: 'Completion', formatter: () => kpi.completionRate + '%' }
                        }
                    }
                }
            },
            theme: { mode: $('body').hasClass('dark-mode') ? 'dark' : 'light' }
        };

        if (completionChart) completionChart.destroy();
        completionChart = new ApexCharts(document.getElementById('chart-completion'), options);
        completionChart.render();

        // Manual Legend
        $('#donut-legend').html(`
            <div class="d-flex align-items-center gap-2 mb-2"><span class="rounded-circle" style="width:10px;height:10px;background:#12b76a"></span><span class="fs-12 fw-600">Completed (${kpi.tasksCompleted})</span></div>
            <div class="d-flex align-items-center gap-2 mb-2"><span class="rounded-circle" style="width:10px;height:10px;background:#f79009"></span><span class="fs-12 fw-600">Pending (${kpi.pendingTasks})</span></div>
            <div class="d-flex align-items-center gap-2"><span class="rounded-circle" style="width:10px;height:10px;background:#f04438"></span><span class="fs-12 fw-600">Refused (${kpi.refusedTasks})</span></div>
        `);
    }

    // ─── Tasks by Resident — horizontal bar ───────────────────────────────────

    function renderResidentChart(byResident) {
        var options = {
            chart: {
                type: 'bar',
                height: 220,
                toolbar: { show: false },
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: ['#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#10b981'],
            plotOptions: {
                bar: { horizontal: true, barHeight: '55%', distributed: true, borderRadius: 4 }
            },
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                formatter: (val, opts) => {
                    var item = byResident[opts.dataPointIndex];
                    return item ? item.completed + '/' + item.total : '';
                },
                style: { fontSize: '12px', fontWeight: 700 }
            },
            series: [{
                name: 'Done',
                data: byResident.map(r => ({ x: r.name, y: r.completed }))
            }],
            xaxis: { type: 'category', labels: { style: { colors: '#9ca3af' } } },
            grid: { show: false },
            legend: { show: false },
            theme: { mode: $('body').hasClass('dark-mode') ? 'dark' : 'light' }
        };

        if (residentChart) residentChart.destroy();
        residentChart = new ApexCharts(document.getElementById('chart-residents'), options);
        residentChart.render();
    }
});
