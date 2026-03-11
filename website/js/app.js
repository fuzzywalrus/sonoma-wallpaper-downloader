/**
		 * Vanilla JS fork of fitVids.js by Dave Rupert
		 * https://github.com/davatron5000/FitVids.js
		 *
		 * (c) 2020 Chris Ferdinandi, MIT License, https://gomakethings.com
		 */
var FitVids = (function () {

    'use strict';

    /**
     * Create the Constructor object
     */
    var Constructor = function (selectors) {

        //
        // Variables
        //

        // Default video players
        var defaults = 'iframe[src*="player.vimeo.com"], iframe[src*="youtube.com"]';

        // Public APIs object
        var publicAPIs = {};

        // Placeholder for video elements
        var vids;


        //
        // Methods
        //

        /**
         * Inject video resizing styles
         * https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
         */
        var addStyles = function () {

            // Don't run if there are already styles on the page
            if (document.querySelector('#fitvids-styles')) return;

            // Get the head element
            var head = document.head || document.getElementsByTagName('head')[0];

            // Create styles
            var css = '.fitvids{width:100%;position:relative;padding:0;}.fitvids iframe,.fitvids object,.fitvids embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
            var div = document.createElement('div');
            div.innerHTML = '<p>x</p><style id="fitvids-styles">' + css + '</style>';

            // Inject styles into the DOM
            head.appendChild(div.childNodes[1]);

        };

        /**
         * Wrap videos in wrapper element
         */
        var wrapVids = function () {

            vids.forEach(function (vid) {

                // Don't run on existing fitvids wrapped content
                if ((vid.tagName.toLowerCase() === 'embed' && vid.closest('object')) || vid.closest('.fitvids')) return;

                // Get properties
                var height = parseFloat(vid.height);
                var width = parseFloat(vid.width);

                // Don't run if there's no valid height or width properties
                if (!height || !width || isNaN(height) || isNaN(width)) return;

                // Create wrapper
                var wrapper = document.createElement('div');
                wrapper.className = 'fitvids';
                wrapper.style.paddingTop = ((height / width) * 100)  + '%';

                // Wrap the video and inject back into the DOM
                vid.parentNode.insertBefore(wrapper, vid);
                wrapper.appendChild(vid);


            });
        };

        /**
         * Initialize plugin
         */
        var init = function () {

            // Get the video elements
            // If custom selectors were provided, use them
            // Otherwise, use defaults
            vids = Array.from(document.querySelectorAll(selectors || defaults));

            // If there are no matching videos, bail
            if (!vids.length) return;

            // Add wrapper styles
            addStyles();

            // Wrap videos
            wrapVids();

        };

        /**
         * Re-render videos if DOM is updated
         */
        publicAPIs.render = function () {
            init();
        };


        //
        // Initialize the instance and return the Public APIs
        //

        init();
        return publicAPIs;

    };


    //
    // Return the Constructor
    //

    return Constructor;

})();

var videos = new FitVids();

videos.render();

/**
 * Pixel assembly reveal for the hero video.
 * Captures a frame of the video, splits it into tiles, launches them
 * outward from the centre, then assembles them back — an inverse explosion.
 * Once the animation finishes the video fades in and starts playing.
 */
var initVideoPixelAssembly = function () {

    'use strict';

    var video = document.getElementById('video');
    if (!video) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    var parent = video.parentNode;
    if (!parent) return;

    var stage = document.createElement('div');
    stage.className = 'video-reveal-stage';
    parent.insertBefore(stage, video);
    stage.appendChild(video);
    video.classList.add('video-reveal-target');

    var canvas = document.createElement('canvas');
    canvas.className = 'video-particle-canvas';
    stage.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        video.classList.add('video-reveal-visible');
        canvas.remove();
        return;
    }

    var TILE     = 20;
    var DURATION = 1600;
    var STAGGER  = 0.32;

    var W = 0, H = 0;
    var OX = 0, OY = 0; // canvas extends OX px left/right and OY px above/below stage
    var tiles    = [];
    var rafId    = 0;
    var startTime = 0;
    var ended    = false;
    var snapshot = null;

    var clamp = function (v, lo, hi) {
        return Math.min(hi, Math.max(lo, v));
    };

    var easeOutExpo = function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    var resizeCanvas = function () {
        W = stage.clientWidth  || 1;
        H = stage.clientHeight || 1;
        // Extend canvas so tiles are visible while flying outside the stage bounds
        var pad = Math.round(Math.max(W, H) * 0.7);
        OX = pad;
        OY = pad;
        var cw = W + 2 * OX;
        var ch = H + 2 * OY;
        canvas.width  = cw;
        canvas.height = ch;
        canvas.style.width  = cw + 'px';
        canvas.style.height = ch + 'px';
        // Override CSS inset: 0 so canvas extends beyond stage
        canvas.style.left   = -OX + 'px';
        canvas.style.top    = -OY + 'px';
        canvas.style.right  = 'auto';
        canvas.style.bottom = 'auto';
    };

    var buildTiles = function () {
        var cols = Math.ceil(W / TILE);
        var rows = Math.ceil(H / TILE);
        tiles = [];
        // Work in canvas coordinate space (stage origin is at OX, OY within canvas)
        var cw = W + 2 * OX;
        var ch = H + 2 * OY;
        var cx = cw / 2;
        var cy = ch / 2;
        var maxDist = Math.sqrt(cx * cx + cy * cy);

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var tx = c * TILE; // stage-space target (for snapshot sampling)
                var ty = r * TILE;
                var destX = tx + OX; // canvas-space destination
                var destY = ty + OY;
                var dx = destX - cx;
                var dy = destY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var delay = (dist / maxDist) * STAGGER;
                var angle = Math.atan2(dy, dx);
                var launchDist = maxDist * 0.9 + Math.random() * maxDist * 0.4;
                tiles.push({
                    tx: tx, ty: ty,
                    destX: destX, destY: destY,
                    offX: Math.cos(angle) * launchDist,
                    offY: Math.sin(angle) * launchDist,
                    delay: delay
                });
            }
        }
    };

    var finish = function () {
        ended = true;
        cancelAnimationFrame(rafId);
        canvas.remove();
        stage.style.overflow = ''; // restore overflow: hidden for border-radius clipping
        video.classList.add('video-reveal-visible');
        video.currentTime = 0;
        video.play();
    };

    var frame = function (now) {
        if (!startTime) startTime = now;
        var elapsed  = now - startTime;
        var globalT  = clamp(elapsed / DURATION, 0, 1);
        var cw = W + 2 * OX;
        var ch = H + 2 * OY;

        ctx.clearRect(0, 0, cw, ch);

        if (snapshot) {
            for (var i = 0; i < tiles.length; i++) {
                var tile   = tiles[i];
                var localT = clamp((globalT - tile.delay) / (1 - STAGGER), 0, 1);
                var ease   = easeOutExpo(localT);
                var x = tile.destX + tile.offX * (1 - ease);
                var y = tile.destY + tile.offY * (1 - ease);
                ctx.drawImage(snapshot, tile.tx, tile.ty, TILE, TILE, x, y, TILE, TILE);
            }
        }

        if (globalT >= 1) {
            finish();
            return;
        }

        rafId = requestAnimationFrame(frame);
    };

    var setup = function () {
        if (ended || rafId) return;
        video.pause();
        resizeCanvas();
        // Allow canvas to extend beyond the stage while animation plays
        stage.style.overflow = 'visible';

        var offscreen = document.createElement('canvas');
        offscreen.width  = W;
        offscreen.height = H;
        var offCtx = offscreen.getContext('2d');
        if (!offCtx) { finish(); return; }
        try {
            offCtx.drawImage(video, 0, 0, W, H);
            snapshot = offscreen;
        } catch (e) {
            // Cross-origin or empty frame — skip animation
            finish();
            return;
        }

        buildTiles();
        rafId = requestAnimationFrame(frame);
    };

    if (video.readyState >= 2) {
        setup();
    } else {
        video.addEventListener('loadeddata', setup, { once: true });
        window.setTimeout(setup, 1200);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden && !ended) {
            finish();
        }
    });
};

initVideoPixelAssembly();
