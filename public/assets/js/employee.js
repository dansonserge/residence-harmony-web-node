/**
 * employee.js — Résidence Harmonie
 * Handles client-side interactions:
 *  - Task status updates via Fetch API
 *  - Instant AJAX-style navigation for tabs and resident list
 *  - Auto-save for observations
 */

$(function () {
    'use strict';

    const API_BASE = window.ENV ? window.ENV.API_BASE : 'http://localhost:3001';

    // ─── Task Status Action Buttons ──────────────────────────────────────────

    $(document).on('click', '.btn-task-action', async function () {
        const $btn = $(this);
        const $card = $btn.closest('.task-card');
        const taskId = $card.data('task-id');
        const newStatus = $btn.data('status');
        const observation = $card.find('.task-observation').val();

        if (newStatus === 'N/A') return;

        // 1. Visual feedback (Immediate)
        $card.find('.btn-task-action').removeClass('active-done active-progress active-refused');
        if (newStatus === 'Done') $btn.addClass('active-done');
        else if (newStatus === 'In Progress') $btn.addClass('active-progress');
        else if (newStatus === 'Refused') $btn.addClass('active-refused');

        // Update badge
        const $badge = $card.find('.badge');
        $badge.removeClass('badge-done badge-refused badge-pending');
        if (newStatus === 'Done') $badge.addClass('badge-done').html('✓ Done');
        else if (newStatus === 'In Progress') $badge.addClass('badge-pending').html('↻ In Progress');
        else if (newStatus === 'Refused') $badge.addClass('badge-refused').html('✗ Refused');

        // 2. API Call (Background)
        try {
            await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, observation: observation })
            });
        } catch (error) {
            console.error('[Employee] Network error during task update:', error);
        }
    });

    // ─── Instant Navigation (Tabs & Resident List) ──────────────────────────

    $(document).on('click', '#period-tabs-wrapper .nav-link, .resident-item', async function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        if (!url) return;

        // Fetch new content
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Swap containers
            $('#task-list-wrapper').html(doc.querySelector('#task-list-wrapper').innerHTML);
            $('#summary-bar').html(doc.querySelector('#summary-bar').innerHTML);
            $('#task-header').html(doc.querySelector('#task-header').innerHTML);
            $('#period-tabs-wrapper').html(doc.querySelector('#period-tabs-wrapper').innerHTML);
            
            // Re-highlight resident list
            $('.resident-item').removeClass('active');
            const newResId = new URLSearchParams(url.split('?')[1]).get('residentId');
            $(`.resident-item[href*="residentId=${newResId}"]`).addClass('active');

            // Update URL
            history.pushState(null, '', url);
        } catch (err) {
            window.location.href = url;
        }
    });

    // ─── Auto-save Observation ───────────────────────────────────────────────

    let typingTimer;
    $(document).on('input', '.task-observation', function () {
        const $textarea = $(this);
        const taskId = $textarea.closest('.task-card').data('task-id');
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(async () => {
            const observation = $textarea.val();
            try {
                await fetch(`${API_BASE}/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ observation: observation })
                });
            } catch (e) {}
        }, 800);
    });

});
