/**
 * notifications.js — Résidence Harmonie
 * Populates the header notification bell dropdown.
 * Uses resident data from the API as the notification source.
 */

$(function () {
    'use strict';

    // Colour palette for initials avatars (matches existing React app)
    var AVATAR_COLORS = [
        { bg: '#dbeafe', text: '#1e40af' },
        { bg: '#dcfce7', text: '#15803d' },
        { bg: '#fef3c7', text: '#92400e' },
        { bg: '#f3e8ff', text: '#7e22ce' },
        { bg: '#fee2e2', text: '#991b1b' }
    ];

    // Static notification data (matches existing implementation)
    var NOTIFICATIONS = [
        {
            name: 'Jean Dupuis',
            text: 'a complété toutes ses tâches du matin',
            time: '5 min ago',  online: true,  type: 'Tâche',
            image: 'https://ui-avatars.com/api/?name=Jean+Dupuis&background=dbeafe&color=1e40af&size=40'
        },
        {
            name: 'Lucie Tremblay',
            text: 'a refusé la douche du matin',
            time: '12 min ago', online: false, type: 'Refus',
            image: 'https://ui-avatars.com/api/?name=Lucie+Tremblay&background=dcfce7&color=15803d&size=40'
        },
        {
            name: 'Robert Gagnon',
            text: 'a une nouvelle observation signalée',
            time: '30 min ago', online: true,  type: 'Observation',
            image: 'https://ui-avatars.com/api/?name=Robert+Gagnon&background=fef3c7&color=92400e&size=40'
        },
        {
            name: 'Monique Rousseau',
            text: 'a demandé une aide supplémentaire',
            time: '1 hr ago',   online: true,  type: 'Alerte',
            image: 'https://ui-avatars.com/api/?name=Monique+Rousseau&background=f3e8ff&color=7e22ce&size=40'
        },
        {
            name: 'Pierre Martin',
            text: 'tâches de l\'après-midi en cours',
            time: '2 hr ago',   online: false, type: 'Tâche',
            image: 'https://ui-avatars.com/api/?name=Pierre+Martin&background=fee2e2&color=991b1b&size=40'
        }
    ];

    /**
     * Build a notification avatar element.
     * Falls back to coloured initials if the image path is unavailable.
     */
    function buildAvatar(notif, index) {
        var colors  = AVATAR_COLORS[index % AVATAR_COLORS.length];
        var initials = notif.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase();
        var onlineClass = notif.online ? 'bg-success' : 'bg-danger';

        var $wrapper = $('<span>').addClass('position-relative d-inline-block');

        // Try image first; swap to initials on error
        var $img = $('<img>')
            .addClass('notif-avatar')
            .attr('src', notif.image)
            .attr('alt', notif.name)
            .on('error', function () {
                $(this).replaceWith(
                    $('<span>')
                        .addClass('notif-avatar-initials')
                        .text(initials)
                        .css({ background: colors.bg, color: colors.text })
                );
            });

        var $dot = $('<span>')
            .addClass('notif-online-dot ' + onlineClass);

        return $wrapper.append($img).append($dot);
    }

    /**
     * Render all notification items into the dropdown list.
     */
    function renderNotifications() {
        var $list = $('#notification-list').empty();

        $.each(NOTIFICATIONS, function (i, notif) {
            var $item = $('<a>')
                .attr('href', '#')
                .addClass('dropdown-item d-flex align-items-start gap-3 py-2 px-3 border-bottom')
                .on('click', function (e) { e.preventDefault(); });

            var $avatar = buildAvatar(notif, i);

            var $body = $('<span>').addClass('flex-1');
            var $text = $('<span>').addClass('d-block fs-12 text-muted mb-1')
                .append($('<strong>').addClass('text-dark').text(notif.name + ' '))
                .append(document.createTextNode(notif.text));
            var $meta = $('<span>').addClass('d-flex align-items-center gap-1 fs-10 text-muted')
                .append($('<span>').text(notif.type))
                .append($('<span>').addClass('rounded-circle bg-secondary d-inline-block').css({ width: 4, height: 4 }))
                .append($('<span>').text(notif.time));

            $body.append($text).append($meta);
            $item.append($avatar).append($body);
            $list.append($item);
        });
    }

    renderNotifications();

    // Show orange ping badge on bell
    $('#notification-count').text(NOTIFICATIONS.length);

    // Clear badge when dropdown is opened
    $('#notification-dropdown').on('show.bs.dropdown', function () {
        $('#notification-badge').addClass('d-none');
    });

});
