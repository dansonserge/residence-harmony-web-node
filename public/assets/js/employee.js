/**
 * employee.js — Résidence Harmonie (HTMX Edition)
 * Focused strictly on light mutations: status updates and debounced auto-saves.
 * All routing and dynamic DOM updates are handled automatically by HTMX.
 */
$(function () {
    'use strict';

    const API_BASE = window.ENV ? window.ENV.API_BASE : 'http://localhost:3001';

    // ─── Task Status Action Buttons (Optimistic UI + Background Patch) ───
    $(document).on('click', '.btn-task-action', async function () {
        const $btn = $(this);
        const $card = $btn.closest('.task-card');
        const taskId = $card.data('task-id');
        const newStatus = $btn.data('status');
        const observation = $card.find('.task-observation').val();

        if (newStatus === 'N/A') return;

        // Visual feedback (Immediate UI updates)
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

        // Background API patch
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

    // ─── Auto-save Observation (Debounced) ───
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
