export class InputController {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            fire: false
        };
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        this.scrollDelta = 0;

        this.isTouch = window.matchMedia('(pointer: coarse)').matches ||
            navigator.maxTouchPoints > 0 ||
            window.location.search.indexOf('touch=1') > -1;

        this._initListeners();
        if (this.isTouch) this._initTouch();
    }

    _initListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => this._onKeyDown(e));
        document.addEventListener('keyup', (e) => this._onKeyUp(e));

        // Mouse Move (Pointer Lock ideally, but simple for now)
        document.addEventListener('mousemove', (e) => this._onMouseMove(e));
        document.addEventListener('mousedown', () => {
            if (!this.isTouch) this.keys.fire = true;
        });
        document.addEventListener('mouseup', () => {
            if (!this.isTouch) this.keys.fire = false;
        });

        // Mouse Wheel
        document.addEventListener('wheel', (e) => this._onWheel(e));
    }

    _onKeyDown(e) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space': this.keys.fire = true; break;
        }
    }

    _onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'Space': this.keys.fire = false; break;
        }
    }

    _onMouseMove(e) {
        // If pointer locked, use movementX/Y
        if (document.pointerLockElement === document.body) {
            this.mouseDeltaX = e.movementX;
            this.mouseDeltaY = e.movementY;
        } else {
            // Fallback (less accurate)
            this.mouseDeltaX = 0;
            this.mouseDeltaY = 0;
        }
    }

    _onWheel(e) {
        this.scrollDelta = e.deltaY;
    }

    /* ------------------------------------------------------------------ touch */
    _initTouch() {
        document.body.classList.add('touch-mode');

        const stick = document.getElementById('touch-stick');
        const knob = document.getElementById('touch-knob');
        const fire = document.getElementById('touch-fire');
        const keys = this.keys;
        if (!stick || !knob || !fire) return;

        const radius = 44;
        let stickId = null;

        const applyStick = (event) => {
            const rect = stick.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let dx = event.clientX - cx;
            let dy = event.clientY - cy;
            const length = Math.hypot(dx, dy) || 1;
            const clamped = Math.min(length, radius);
            dx = (dx / length) * clamped;
            dy = (dy / length) * clamped;

            knob.style.transform =
                'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';

            const nx = dx / radius;
            const ny = dy / radius;
            keys.left = nx < -0.22;
            keys.right = nx > 0.22;
            keys.forward = ny < -0.22;
            keys.backward = ny > 0.22;
        };

        stick.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            stickId = event.pointerId;
            try { stick.setPointerCapture(event.pointerId); } catch (err) { /* synthetic pointer */ }
            applyStick(event);
        });

        stick.addEventListener('pointermove', (event) => {
            if (event.pointerId === stickId) applyStick(event);
        });

        const releaseStick = (event) => {
            if (event.pointerId !== stickId) return;
            stickId = null;
            knob.style.transform = 'translate(-50%, -50%)';
            keys.left = keys.right = keys.forward = keys.backward = false;
        };

        stick.addEventListener('pointerup', releaseStick);
        stick.addEventListener('pointercancel', releaseStick);

        /* fire */
        const fireOn = (event) => {
            event.preventDefault();
            event.stopPropagation();
            keys.fire = true;
            fire.classList.add('active');
        };
        const fireOff = () => {
            keys.fire = false;
            fire.classList.remove('active');
        };

        fire.addEventListener('pointerdown', fireOn);
        fire.addEventListener('pointerup', fireOff);
        fire.addEventListener('pointercancel', fireOff);
        fire.addEventListener('pointerleave', fireOff);

        /* look drag + pinch zoom */
        const pointers = new Map();
        let pinchStart = 0;

        const spread = () => {
            const list = Array.from(pointers.values());
            if (list.length < 2) return 0;
            return Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
        };

        document.body.addEventListener('pointerdown', (event) => {
            if (event.target.closest('#touch-controls')) return;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (pointers.size === 2) pinchStart = spread();
        });

        document.body.addEventListener('pointermove', (event) => {
            const point = pointers.get(event.pointerId);
            if (!point) return;

            if (pointers.size === 1) {
                this.mouseDeltaX += event.clientX - point.x;
                this.mouseDeltaY += event.clientY - point.y;
            }

            point.x = event.clientX;
            point.y = event.clientY;

            if (pointers.size === 2) {
                const current = spread();
                if (pinchStart > 0 && current > 0) {
                    this.scrollDelta += (pinchStart - current) * 0.6;
                }
                pinchStart = current;
            }
        });

        const releaseLook = (event) => {
            pointers.delete(event.pointerId);
            pinchStart = 0;
        };

        document.body.addEventListener('pointerup', releaseLook);
        document.body.addEventListener('pointercancel', releaseLook);
    }

    // Called every frame to clear deltas
    update() {
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        this.scrollDelta = 0;
    }
}
