/**
 * sidebar.js — Résidence Harmonie
 * Handles:
 *  - Sidebar collapse / expand (persisted in localStorage)
 *  - Dark mode toggle (persisted in localStorage)
 *  - Active nav-item highlighting based on current page filename
 */

$(function () {
    'use strict';

    var SIDEBAR_KEY = 'rh_sidebar_expanded';
    var DARK_KEY    = 'rh_dark_mode';

    // ── 1. Sidebar collapse / expand ─────────────────────────────────────────

    var isExpanded = localStorage.getItem(SIDEBAR_KEY) !== 'false';

    function applySidebarState() {
        if (isExpanded) {
            $('body').removeClass('sidebar-collapse');
        } else {
            $('body').addClass('sidebar-collapse');
        }
        localStorage.setItem(SIDEBAR_KEY, String(isExpanded));
    }

    // Apply stored state immediately on load
    applySidebarState();

    // Hamburger toggle button
    $(document).on('click', '#btn-sidebar-toggle', function (e) {
        e.preventDefault();
        isExpanded = !isExpanded;
        applySidebarState();
    });

    // ── 2. Dark mode ─────────────────────────────────────────────────────────

    var isDark = localStorage.getItem(DARK_KEY) === 'true';

    function applyDarkMode() {
        $('body').toggleClass('dark-mode', isDark);
        // Swap icon: moon when light, sun when dark
        var $icon = $('#btn-dark-toggle i');
        if (isDark) {
            $icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            $icon.removeClass('fa-sun').addClass('fa-moon');
        }
        localStorage.setItem(DARK_KEY, String(isDark));
    }

    applyDarkMode();

    $(document).on('click', '#btn-dark-toggle', function () {
        isDark = !isDark;
        applyDarkMode();
    });

    // ── 3. Active nav item highlight ─────────────────────────────────────────
    // Each <a> in the sidebar carries a data-page attribute matching the HTML filename.
    // e.g.  <a href="manager.html" data-page="manager">

    var currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (!currentPage) currentPage = 'index';

    $('.nav-sidebar .nav-link').each(function () {
        var page = $(this).data('page');
        if (page && page === currentPage) {
            $(this).addClass('active');
        }
    });

    // ── 4. Populate user dropdown avatar ────────────────────────────────────

    $('#header-user-name').text('Admin User');
    $('#header-user-initials')
        .text('AU')
        .css({ background: '#dbeafe', color: '#1e40af' });

});
