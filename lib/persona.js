"use strict";

/*globals ajaxify, config, utils, app, socket, Slideout, NProgress*/

$(document).ready(function() {
	setupNProgress();
	setupTaskbar();
	setupEditedByIcon();
	setupMobileMenu();

	var env = utils.findBootstrapEnvironment();

	if (env === 'xs' || env ==='sm') {
		$(".navbar-fixed-top").autoHidingNavbar({
			showOnBottom: false
		});
	}

	function setupNProgress() {
		$(window).on('action:ajaxify.start', function() {
			NProgress.set(0.7);
		});

		$(window).on('action:ajaxify.end', function() {
			NProgress.done();
			setupHoverCards();
		});
	}

	function setupTaskbar() {
		$(window).on('filter:taskbar.push', function(ev, data) {
			data.options.className = 'taskbar-' + data.module;

			if (data.module === 'composer') {
				data.options.icon = 'fa-plus';
			} else if (data.module === 'chat') {
				if (!data.element.length) {
					createChatIcon(data);
					$(window).one('action:taskbar.pushed', function(ev, data) {
						updateChatCount(data.element);
					});

				} else if (!data.element.hasClass('active')) {
					updateChatCount(data.element);
				}
			}
		});

		function createChatIcon(data) {
			data.options.icon = 'fa-spinner fa-spin';

			$.getJSON(config.relative_path + '/api/user/' + utils.slugify(data.options.title), function(user) {
				var el = $('#taskbar [data-uuid="' + data.uuid + '"] a');
				el.find('i').remove();
				if (user.picture) {
					el.css('background-image', 'url(' + user.picture + ')');
				} else {
					el	.css('background-color', user['icon:bgColor'])
						.text(user['icon:text'])
						.addClass('user-icon');
				}
			});
		}

		function updateChatCount(el) {
			var count = (parseInt($(el).attr('data-content'), 10) || 0) + 1;
			$(el).attr('data-content', count);
		}
	}

	function setupEditedByIcon() {
		function activateEditedTooltips() {
			$('[data-pid] [component="post/editor"]').each(function() {
				var el = $(this), icon;

				if (!el.attr('data-editor')) {
					return;
				}

				icon = el.parents('[data-pid]').find('.edit-icon');
				icon.prop('title', el.text()).tooltip('fixTitle').removeClass('hidden');
			});
		}

		$(window).on('action:posts.edited', function(ev, data) {
			var parent = $('[data-pid="' + data.post.pid + '"]'),
				icon = parent.find('.edit-icon'),
				el = parent.find('[component="post/editor"]');

			icon.prop('title', el.text()).tooltip('fixTitle').removeClass('hidden');
		});

		$(window).on('action:topic.loaded', activateEditedTooltips);
		$(window).on('action:posts.loaded', activateEditedTooltips);
	}

	function setupMobileMenu() {
		if (!window.addEventListener) {
			return;
		}

		$('#menu').removeClass('hidden');

		var slideout = new Slideout({
			'panel': document.getElementById('panel'),
			'menu': document.getElementById('menu'),
			'padding': 256,
			'tolerance': 70,
			'side': 'right'
		});

		$('#mobile-menu').on('click', function() {
			slideout.toggle();
		});

		$('#menu a').on('click', function() {
			slideout.close();
		});

		$(window).on('resize action:ajaxify.start', function() {
			slideout.close();
		});

		function openingMenuAndLoad() {
			openingMenu();
			loadNotificationsAndChat();
		}

		function openingMenu() {
			$('#header-menu').css({
				'top': $(window).scrollTop() + 'px',
				'position': 'absolute'
			});

			loadNotificationsAndChat();
		}

		function loadNotificationsAndChat() {
			require(['chat', 'notifications'], function(chat, notifications) {
				chat.loadChatsDropdown($('#menu [data-section="chats"] ul'));
				notifications.loadNotifications($('#menu [data-section="notifications"] ul'));
			});
		}

		slideout.on('open', openingMenuAndLoad);
		slideout.on('touchmove', function(target) {
			var $target = $(target);
			if ($target.length && ($target.is('code') || $target.parents('code').length)) {
				slideout._preventOpen = true;
			}
		});

		slideout.on('close', function() {
			$('#header-menu').css({
				'top': '0px',
				'position': 'fixed'
			});
			$('.slideout-open').removeClass('slideout-open');
		});

		$('#menu [data-section="navigation"] ul').html($('#main-nav').html() + ($('#logged-out-menu').html() || ''));
		$('#menu [data-section="profile"] ul').html($('#user-control-list').html())
			.find('[component="user/status"]').remove();
	}

	function setupHoverCards() {
		require(['components'], function(components) {
			components.get('user/picture')
				.on('mouseover', generateUserCard);
		});	
	}

	function generateUserCard() {
		var avatar = $(this),
			index = avatar.parents('[data-index]').attr('data-index'),
			data = (ajaxify.data.topics || ajaxify.data.posts)[index].user;

		$('.persona-usercard').remove();

		socket.emit('user.isFollowing', {uid: data.uid}, function(err, isFollowing) {
			app.parseAndTranslate('modules/usercard', data, function(html) {
				var card = $(html);
				avatar.parents('a').after(card.hide());

				if (parseInt(app.user.uid, 10) === parseInt(data.uid, 10) || !app.user.uid) {
					card.find('.btn-morph').hide();
				} else {							
					card.find('.btn-morph').click(function(ev) {
						var type = $(this).hasClass('plus') ? 'follow' : 'unfollow';

						socket.emit('user.' + type, {uid: data.uid}, function(err) {
							if (err) {
								return app.alertError(err.message);
							}

							app.alertSuccess('[[global:alert.' + type + ', ' + data.username + ']]');
						});

						$(this).toggleClass('plus').toggleClass('heart');

						if ($(this).find('b.drop').length === 0) {
							$(this).prepend('<b class="drop"></b>');
						}

						var drop = $(this).find('b.drop').removeClass('animate'),
							x = ev.pageX - drop.width() / 2 - $(this).offset().left,
							y = ev.pageY - drop.height() / 2 - $(this).offset().top;

						drop.css({top: y + 'px', left: x + 'px'}).addClass('animate');
					});

					if (isFollowing) {
						$('.btn-morph').addClass('heart');
					} else {
						$('.btn-morph').addClass('plus');
					}
				}

				utils.makeNumbersHumanReadable(card.find('.human-readable-number'));

				card.on('mouseleave', function() {
					card.fadeOut(function() {
						card.remove();
					});
				});

				card.fadeIn();
			});
		});
	}
});