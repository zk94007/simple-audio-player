/*
 * jQuery Simple Audio Player Plugin
 * http://github.com/dradl/jquery-simpleaudioplayer
 * Requires jQuery 1.4.2
 *
 * Copyright 2018, Dominik Radl.
 * Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) 
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

$.fn.simpleAudioPlayer = function ( options ) {
	var outerThis = this;

	var settings = $.extend({
		chapters: [],
        fadeOutSpeed: 3
	}, options );
	
	var chapters = [];
	var duration = 0;
	var currentTime = 0;
	var currentChapter = 0;
	var isFireFox = false;

    var classes = {
    	'player': '.simpleAudioPlayer',
    	'progressBar': '.progressBar',
    	'progressBarInner': '.progressBarInner',
    	'progressIndicator': '.progressIndicator',
    	'progressTime': '.progressTime',
    	'durationTime': '.durationTime',
    	'waves': '.waves',
    	'play': '.play',
    	'pause': '.pause',
    	'stop': '.stop',
    	'forward': '.forward',
		'backward': '.backward',
		'prev': '.prev',
		'next': '.next',
    	'menuToggle': '.menuToggle',
    	'chapterList': '.chapterList',
    	'chapterLink': '.chapterLink'
    	/*'faster': '.faster',
    	'slower': '.slower',
    	'resetSpeed': '.resetSpeed',
    	'fadeOut': '.fadeOut',*/
	};
	
	if(navigator.userAgent.indexOf("Firefox") != -1) {
		isFireFox = true;
	}

    return this.each(function(index, element) {
    	
    	// some setup
		
		var self = $(this);
		var currentInstance;

    	if (self.prop( 'tagName' ).toLowerCase() != 'audio') {
			return false;
		}

		if (!createjs.Sound.initializeDefaultPlugins()) {return;}

		// load audio file

		for (var i = 0; i < settings.chapters.length; i++) {
			if(isFireFox && !settings.chapters[i].ogg) // firefox
			{
				console.log('No audio files.');
				return true;
			} else if (!settings.chapters[i].mp3) { // chrome or other browser
				console.log('No audio files.');
				return true;
			}
		}

		// init createjs

		createjs.Sound.alternateExtensions = ["mp3", "ogg"];
		createjs.Sound.addEventListener("fileload", handleLoad);
		var sounds = Array();
		for (var i = 0; i < settings.chapters.length; i++) {
			var src = isFireFox ? settings.chapters[i].ogg : settings.chapters[i].mp3;
			sounds.push({id: "" + i, src: src});
		}

        createjs.Sound.registerSounds(sounds, "");
		
		//duration

		function handleLoad(event) {
			var instance = createjs.Sound.createInstance(event.id);
			chapters.push( { id: "" + event.id, duration: instance.duration / 1000, instance: instance } );
			duration += instance.duration / 1000;
			if (chapters.length === settings.chapters.length) {
				chapters.sort(function(c1, c2) { return parseInt(c1.id) - parseInt(c2.id); });

				get('next').hasClass('inactive') ? get('next').removeClass('inactive') : '';
				get('forward').hasClass('inactive') ? get('forward').removeClass('inactive') : '';
				get('backward').hasClass('inactive') ? get('backward').removeClass('inactive') : '';
				get('prev').hasClass('inactive') ? get('prev').removeClass('inactive') : '';
				get('play').hasClass('inactive') ? get('play').removeClass('inactive') : '';
				get('pause').hasClass('inactive') ? get('pause').removeClass('inactive') : '';

				refreshUI();
			}
		}
		
		// build the markup and hide html5 audio element 
		
		var wrapper = '<div class="' + classes['player'].substr(1) + '">' +
			'<div class="containerTop cf">' +
				'<div class="controls row">' +
					'<div class="col c2 inactive ' + classes['prev'].substr(1) + '"><span class="icon icon-prev"></span></div>' +
					'<div class="col c2 inactive ' + classes['backward'].substr(1) + '"><span class="icon icon-backward"></span></div>' +
					'<div class="col c2 inactive ' + classes['play'].substr(1) + '"><span class="icon icon-play"></span></div>' +
					'<div class="col c2 inactive hide ' + classes['pause'].substr(1) + '"><span class="icon icon-pause"></span></div>' +
					'<div class="col c2 inactive ' + classes['forward'].substr(1) + '"><span class="icon icon-forward"></span></div>' +
					'<div class="col c2 inactive ' + classes['next'].substr(1) + '"><span class="icon icon-next"></span></div>' +
				'</div>' +
			'</div>' +
			'<div class="containerBottom cf">' +
				'<div class="' + classes['progressBar'].substr(1) + '">' +
				'<div class="' + classes['progressTime'].substr(1) + '">&nbsp;</div>' +
				'<div class="' + classes['progressBarInner'].substr(1) + '"></div>' +
				'<div class="' + classes['progressIndicator'].substr(1) + '"></div>' +
				'<div class="' + classes['durationTime'].substr(1) + '">&nbsp;</div>' +
			'</div>' +
		'</div>';

		var player = $(wrapper).insertAfter(self);
		self.css( { 'width': 0, 'height': 0, 'visibility': 'hidden' } );

		function get(index) {
			return player.find(classes[index]);
		}

		// chapters
		
		if (settings.chapters.length > 0) {
			$(classes.player).addClass('hasChapters');
			get('menuToggle').append('<span class="icon icon-menu"></span>');
			
			var chaptersList = '<ul>';
			for (var i = 0; i < settings.chapters.length; i++) {
				chaptersList += '<li><a class="' + classes['chapterLink'].substr(1) + '" data-chapter="' + settings.chapters[i].seconds + '">' + settings.chapters[i].title + '</a></li>';
			}
			chaptersList += '</ul>';
			get('chapterList').append(chaptersList);
		}

		// public methods
		 
		outerThis.jumpBy = function(offset) {
			jumpBy(offset);
		}
		outerThis.jumpTo = function(offset) {
			jumpTo(offset);
		}
		outerThis.fadeOut = function(duration) {
			fadeOut(duration);
		}
		outerThis.fadeOutAfterSeconds = function(duration, offset) {
			fadeOutAfterSeconds(duration, offset);
		}
		outerThis.fadeOutAfterChapter = function(duration, chapter) {
			fadeOutAfterChapter(duration, chapter);
		}
		outerThis.fadeOutAfterPercent = function(duration, percentage) {
			fadeOutAfterPercent(duration, percentage);
		}

		// bind functionality

		// get('progressBar').on('click', sapProgress);
		get('play').on('click', sapPlay);
		get('pause').on('click', sapPause);
		// get('menuToggle').on('click', sapToggleChapters);
		// get('stop').on('click', sapStop);
		get('forward').on('click', sapForward);
		get('backward').on('click', sapBackward);
		get('prev').on('click', sapPrev);
		get('next').on('click', sapNext);
		// get('chapterLink').on('click', sapChapter);
		// get('progressBar')
			// .on('mouseenter', sapProgressEnter)
		    // .on('mouseleave', sapProgressLeave);
		/*get('faster').on('click', sapFaster);
		get('slower').on('click', sapSlower);
		get('resetSpeed').on('click', sapResetSpeed);*/

		// key bindings
		
		$(window).keydown(function(e) {
			switch(e.keyCode) {
				case 32:
					(self[0].paused) ? sapPlay() : sapPause();
					break;
				case 37:
					sapBackward();
					break;
				case 39:
					sapForward();
					break;
			}
		})

		// bound functions

		function sapPlay() {
			chapters[currentChapter].instance.play();
		}

		function sapPause() {
			chapters[currentChapter].instance.paused = true;
			togglePlayPause();
		}

		// function sapStop() {
		// 	resetPlaybackTime();
		// }

		// function sapFaster() {
		// 	self[0].playbackRate += 0.1;
		// }

		function sapPrev() {
			prevChapter();
		}

		function sapNext() {
			nextChapter();
		}

		// function sapSlower() {
		// 	self[0].playbackRate -= 0.1;
		// }

		// function sapResetSpeed() {
		// 	self[0].playbackRate = 1;
		// }

		function sapForward() {
			jumpBy(30);
		}

		function sapBackward() {
			jumpBy(-30);
		}

		// function sapToggleChapters() {
		// 	get('chapterList').slideToggle();
		// }

		// function sapChapter() {
		// 	jumpTo($(this).data('chapter'));
		// }

		// function sapProgress(e) {
		//     var leftOffset = e.pageX - $(this).offset().left;
		//     var songPercents = leftOffset / $(this).innerWidth();
		//     var seconds = songPercents * self[0].duration;
		//     jumpTo(seconds);
		// }

		// function sapProgressEnter() {
		// 	this.iid = setInterval(function() {
		// 		setIndicatorPosition();
		//     }, 10);
		// }

		// function sapProgressLeave() {
		// 	this.iid && clearInterval(this.iid);
		// }

		// helper functions
		
		// function setIndicatorPosition() {
		// 	get('progressBar').on('mousemove', function(e) {
		// 	    var leftOffset = e.pageX - $(this).offset().left;
		// 	    var songPercents = leftOffset / $(this).innerWidth() * 100;
		// 	    get('progressIndicator').css('left', songPercents + '%');
		// 	})
		// }

		setInterval(function() {
			if (chapters.length == settings.chapters.length && !chapters[currentChapter].instance.pause) {
				currentTime = 0;
				for (var i = 0; i< currentChapter; i++) {
					currentTime += chapters[i].duration;
				}
				currentTime += chapters[currentChapter].instance.position / 1000;
				refreshUI();
			} else if (chapters.length == settings.chapters.length && chapters[currentChapter].instance.position >= chapters[currentChapter].instance.duration) {
				nextChapter();
			}
		}, 100);

		function refreshUI() {
			updateControls();
			showTime();
			showProgress();
		}

		function updateControls() {
			if (chapters.length != settings.chapters.length) {
				return;
			}

			if (!offsetIsValid(-30)) {
				!get('backward').hasClass('inactive') ? get('backward').addClass('inactive') : '';
			} else {
				get('backward').hasClass('inactive') ? get('backward').removeClass('inactive') : '';
			}

			if (!offsetIsValid(30)) {
				!get('forward').hasClass('inactive') ? get('forward').addClass('inactive') : '';
			} else {
				get('forward').hasClass('inactive') ? get('forward').removeClass('inactive') : '';
			}

			if (currentChapter == 0) {
				!get('prev').hasClass('inactive') ? get('prev').addClass('inactive') : '';
			} else {
				get('prev').hasClass('inactive') ? get('prev').removeClass('inactive') : '';
			}

			if (currentChapter == settings.chapters.length - 1) {
				!get('next').hasClass('inactive') ? get('next').addClass('inactive') : '';
			} else {
				get('next').hasClass('inactive') ? get('next').removeClass('inactive') : '';
			}

			if (chapters[currentChapter].instance.playState == null || chapters[currentChapter].instance.paused == true) {
				!get('pause').hasClass('hide') ? get('pause').addClass('hide') : '';
				get('play').hasClass('hide') ? get('play').removeClass('hide') : '';
			} else {				
				!get('play').hasClass('hide') ? get('play').addClass('hide') : '';
				get('pause').hasClass('hide') ? get('pause').removeClass('hide') : '';
			}
		}

		function showTime() {
			var left = duration - currentTime;
			var leftMinutes = Math.round(Math.floor(left / 60));
			var leftSeconds = Math.round(left - leftMinutes * 60);
			var durationTime = ('0'  + leftMinutes).slice(-2)+':'+('0' + leftSeconds).slice(-2);

			var current = currentTime;
			var currentMinutes = Math.round(Math.floor(current / 60));
			var currentSeconds = Math.round(current - currentMinutes * 60);
			var _currentTime = ('0'  + currentMinutes).slice(-2)+':'+('0' + currentSeconds).slice(-2);

			get('progressTime').html(_currentTime);
			get('durationTime').html('- ' + durationTime);
		}

		function showProgress() {
			var percent = currentTime / duration * 100;
			$(get('progressBarInner')).css('width', percent + '%');
		}
		 
		function togglePlayPause() {
			get('play').toggleClass('hide');
			get('pause').toggleClass('hide');
		}

		function nextChapter() {
			if (currentChapter == chapters.length - 1) {
				chapters[currentChapter].instance.paused = true;
				currentChapter = 0;
				currentTime = 0;
				chapters[currentChapter].instance.position = 0;
				refreshUI();
			} else {
				chapters[currentChapter].instance.paused = true;
				currentChapter += 1;
				chapters[currentChapter].instance.position = 0;
				chapters[currentChapter].instance.play();
			}
		}

		function prevChapter() {
			if (currentChapter > 0) {
				chapters[currentChapter].instance.paused = true;
				currentChapter -= 1;
				chapters[currentChapter].instance.position = 0;
				chapters[currentChapter].instance.play();
			}
		}

		function fadeOut(duration) {
		 	duration = (typeof duration !== 'undefined') ? duration : settings.fadeOutSpeed;		
			var speed = duration/1000;
			if(self[0].volume > 0.001){
	        	self[0].volume -= 0.001;
		        setTimeout(fadeOut, speed);
		    }else{
		       	resetPlaybackTime();
		    }
		}

		function jumpBy(offset) {
			if (!offsetIsValid(offset)) return; 
			chapters[currentChapter].instance.position += offset * 1000;
			currentTime += offset;
			refreshUI();
		}

		function jumpTo(second) {
			self[0].currentTime = second;
			refreshUI();
		}

		function offsetIsValid(offset) {
			if (chapters.length != settings.chapters.length) {
				return false;
			}
			var positiveValidOffset = offset > 0 && chapters[currentChapter].instance.position / 1000 < (chapters[currentChapter].duration - offset);
			var negativeValidOffset = offset < 0 && ((chapters[currentChapter].instance.position / 1000 + offset) > 0);
			return (positiveValidOffset || negativeValidOffset) ? true : false;
		}

		// function fadeOutAfterSeconds(duration, offset) {
		// 	offset = (typeof offset !== 'undefined') ? offset * 1000 : 0;
		// 	setTimeout(fadeOut, offset, duration);
		// }

		// function fadeOutAfterChapter(duration, chapter) {
		// 	chapter = (typeof chapter !== 'undefined') ? chapter : 1;
		// 	var chapterTime = settings.chapters[chapter-1] * 1000;
		// 	setTimeout(fadeOut, chapterTime, duration);
		// }

		// function fadeOutAfterPercent(duration, percentage) {
		// 	percentage = (typeof percentage !== 'undefined') ? percentage : 30;
		// 	setTimeout(fadeOut, self[0].duration*(percentage/100), duration);
		// }

		// init() function can be used instead of calling refreshUI directly - currently there's no need for it
		setTimeout(refreshUI, 200);
    }); 
};