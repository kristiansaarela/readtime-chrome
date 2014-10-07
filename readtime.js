;(function () {
	"use strict";

	var Readtime = function (content, wpm) {
		var wpm = wpm || 250,
			wc = content.innerText.toString().trim().split(' ').length,
			m = ~~(wc / wpm),
			s = ~~(wc % wpm / (wpm / 60));

		return (m + ' minute' + (m == 1 ? '' : 's') + ', ' + s + ' second' + (s == 1 ? '' : 's'));
	};

	var Highlighter = function (callback) {
		var self = this;
			self.active = false;

		var elements = {};

		var keycodes = {
			BACKSPACE: 8,
			DELETE: 46,
			ESC: 27
		};

		function createOutlineElements () {
			elements.top    = $('<div class="highlighter">').appendTo('body');
			elements.bottom = $('<div class="highlighter">').appendTo('body');
			elements.left   = $('<div class="highlighter">').appendTo('body');
			elements.right  = $('<div class="highlighter">').appendTo('body');
			elements.box    = $('<div class="highlighter_box">').appendTo('body');
		}

		function removeOutlineElements () {
			$.each(elements, function (ignore, el) {
				el.remove();
			});
		}

		function draw(ev) {
			if (ev.target.className.indexOf('highlighter') !== -1) return;

			var pos = ev.target.getBoundingClientRect();

			elements.box.css({
				top: pos.top,
				left: pos.left,
				width: pos.width,
				height: pos.height
			});
		}

		Highlighter.prototype.start = function () {
			if (!self.active) {
				self.active = true;
				createOutlineElements();

				$('body').bind('keyup.highlighter', function (ev) {
					if (ev.keyCode === keycodes.ESC || ev.keyCode === keycodes.BACKSPACE || ev.keyCode === keycodes.DELETE) {
						self.stop();
					}

					return false;
				});

				setTimeout(function () {
					$('body').bind('click.highlighter', function (ev) {
						if (callback) callback(ev.target);

						self.stop();

						return false;
					});
				}, 50);

				$('body').bind('mousemove.highlighter', draw);
			}
		};

		Highlighter.prototype.stop = function () {
			self.active = false;
			removeOutlineElements();
			$('body')
				.unbind('mousemove.highlighter')
				.unbind('keyup.highlighter')
				.unbind('click.highlighter');
		};

		return self;
	};

	chrome.extension.onMessage.addListener(function (request, sender, response) {
		new Highlighter(function (element) {
			window.alert(Readtime(element));
		}).start();
	});
})();