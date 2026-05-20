/**
 * admin.js — Résidence Harmonie (EJS Edition)
 * Handles visual interactions for Settings:
 *  - Save button status feedback
 *  - Logo file input triggers
 */
$(function () {
    'use strict';

    // ─── Save Settings visual feedback ────────────────────────────────────────
    $('#btn-save-settings').on('click', function () {
        var $btn = $(this);
        $btn.text('Saved ✓').prop('disabled', true);
        setTimeout(function () { 
            $btn.text('Save Settings').prop('disabled', false); 
        }, 2000);
    });

    // ─── Logo upload triggers ─────────────────────────────────────────────────
    $('#logo-upload-btn').on('click', function () {
        $('#logo-file-input').trigger('click');
    });

    $('#logo-file-input').on('change', function () {
        var file = this.files[0];
        if (file) {
            $('#logo-upload-label').text('📎 ' + file.name);
        }
    });
});
