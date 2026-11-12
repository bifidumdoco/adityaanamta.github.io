/* ==========================================================================
   Aditya's Mobile Portfolio — shell behaviour
   ========================================================================== */

(function () {
    "use strict";

    // Same origin as the gallery data, so paths stay relative.
    const MEDIA_BASE = "";

    const DATA = window.GALLERY_DATA || { collections: [], items: [] };
    const ITEMS = DATA.items;

    const CATEGORY_LABELS = {
        commercial: "Commercial",
        packaging: "Packaging",
        illustration: "Illustration",
        identity: "Identity",
        motion: "Commercial Video",
        aiediting: "AI Editing",
    };

    const COLLECTION_STYLE = {
        bifidum: { icon: "fa-shirt", color: "#6366f1" },
        cakralabs: { icon: "fa-robot", color: "#334155" },
        ranuna: { icon: "fa-box-open", color: "#16a34a" },
        nfg: { icon: "fa-brain", color: "#a855f7" },
        langit: { icon: "fa-film", color: "#dc2626" },
        sbm: { icon: "fa-building", color: "#0891b2" },
    };

    const COLLECTIONS = DATA.collections.map(function (collection) {
        return Object.assign({}, collection, COLLECTION_STYLE[collection.id] || {
            icon: "fa-folder",
            color: "#64748b",
        }, {
            count: ITEMS.filter(function (item) { return item.collection === collection.id; }).length,
        });
    });

    const WEBSITES = [
        { name: "cakralabs.me", url: "https://cakralabs.me", icon: "fa-robot", color: "#111827", desc: "Agency site" },
        { name: "myuang.vercel.app", url: "https://myuang.vercel.app", icon: "fa-wallet", color: "#2563eb", desc: "Finance tracker" },
        { name: "evpowering.vercel.app", url: "https://evpowering.vercel.app", icon: "fa-charging-station", color: "#16a34a", desc: "EV landing page" },
        { name: "rotiklasik.vercel.app", url: "https://rotiklasik.vercel.app", icon: "fa-bread-slice", color: "#b45309", desc: "Bakery showcase" },
        { name: "ptsbmgroup.github.io", url: "https://ptsbmgroup.github.io", icon: "fa-building-columns", color: "#0891b2", desc: "SBM Group corporate site" },
    ];

    const APPS = {
        "app-about": { name: "About", icon: "fa-user", color: "linear-gradient(135deg,#FF512F 0%,#DD2476 100%)" },
        "app-experience": { name: "Work", icon: "fa-briefcase", color: "linear-gradient(135deg,#1D976C 0%,#93F9B9 100%)" },
        "app-projects": { name: "Files", icon: "fa-folder-open", color: "linear-gradient(135deg,#8E2DE2 0%,#4A00E0 100%)" },
        "app-contact": { name: "Contact", icon: "fa-paper-plane", color: "linear-gradient(135deg,#F7971E 0%,#FFD200 100%)" },
    };

    const HUB_APP = "app-projects";
    const MAX_RECENTS = 6;

    const stack = [];
    const files = { folder: null, items: [] };
    let viewerIndex = -1;
    let recentOrder = [];

    /* History mirror: one entry per app / folder / viewer. */
    let depth = 0;
    let suppressPop = 0;

    function byId(id) {
        return document.getElementById(id);
    }

    function esc(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function collectionById(id) {
        return COLLECTIONS.find(function (c) { return c.id === id; }) || null;
    }

    function appIsOpen(appId) {
        const app = byId(appId);
        return !!app && app.classList.contains("open");
    }

    /* ------------------------------------------------------------------ clock */
    function updateTime() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
        const date = now.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });

        const clock = byId("clock");
        const widgetTime = byId("widget-time");
        const widgetDate = byId("widget-date");
        const qsTime = byId("qs-time");
        const qsDate = byId("qs-date");

        if (clock) clock.textContent = time;
        if (widgetTime) widgetTime.textContent = time.replace(":", ".");
        if (widgetDate) widgetDate.textContent = date;
        if (qsTime) qsTime.textContent = time.replace(":", ".");
        if (qsDate) qsDate.textContent = date;
    }

    /* ------------------------------------------------------------- navigation */
    function pushNav() {
        depth += 1;
        history.pushState({ nav: depth }, "");
    }

    function leaveToLanding() {
        window.location.href = "index.html";
    }

    function requestBack() {
        if (qsIsOpen()) {
            closeQuickSettings();
            return;
        }
        if (recentsIsOpen()) {
            closeRecents();
            return;
        }
        if (depth > 0) {
            history.back();
            return;
        }
        leaveToLanding();
    }

    function undoOne() {
        if (qsIsOpen()) { closeQuickSettings(); return; }
        if (recentsIsOpen()) { closeRecents(); return; }
        if (viewerIsOpen()) { closeViewer(); return; }
        if (files.folder && appIsOpen(HUB_APP)) { renderFilesRoot(); return; }
        const top = stack[stack.length - 1];
        if (top) { closeApp(top); return; }
    }

    window.addEventListener("popstate", function () {
        if (suppressPop > 0) {
            suppressPop -= 1;
            return;
        }
        if (qsIsOpen() || recentsIsOpen()) {
            closeQuickSettings();
            closeRecents();
            history.pushState({ nav: depth }, "");
            return;
        }
        if (depth > 0) depth -= 1;
        undoOne();
    });

    function resetHistory() {
        const steps = depth;
        if (steps <= 0) return;
        suppressPop += steps;
        depth = 0;
        history.go(-steps);
    }

    /* ------------------------------------------------------------------- files */
    function folderRow(collection) {
        return '<button class="folder-row" data-files-folder="' + esc(collection.id) + '">' +
            '<span class="folder-row__icon" style="background:' + collection.color + '">' +
            '<i class="fas ' + collection.icon + '"></i></span>' +
            "<span><span class=\"folder-row__name\">" + esc(collection.name) + "</span><br>" +
            '<span class="folder-row__meta">' + collection.count + " items · " + esc(collection.tagline) + "</span></span>" +
            "</button>";
    }

    function websiteRow(site) {
        return '<a class="folder-row" href="' + site.url + '" target="_blank" rel="noopener">' +
            '<span class="folder-row__icon" style="background:' + site.color + '">' +
            '<i class="fas ' + site.icon + '"></i></span>' +
            "<span><span class=\"folder-row__name\">" + esc(site.name) + "</span><br>" +
            '<span class="folder-row__meta">' + esc(site.desc) + "</span></span>" +
            "</a>";
    }

    function renderFilesRoot() {
        files.folder = null;
        files.items = [];
        byId("files-title").textContent = "Files";
        byId("files-content").innerHTML =
            '<div class="section-title" style="margin-top:1rem">Collections</div>' +
            COLLECTIONS.map(folderRow).join("") +
            '<button class="folder-row" data-files-folder="all">' +
            '<span class="folder-row__icon" style="background:#525252"><i class="fas fa-layer-group"></i></span>' +
            "<span><span class=\"folder-row__name\">All Work</span><br>" +
            '<span class="folder-row__meta">' + ITEMS.length + " items · Every collection</span></span>" +
            "</button>" +
            '<div class="section-title">Websites</div>' +
            WEBSITES.map(websiteRow).join("") +
            '<div class="h-6"></div>';
        byId("files-content").scrollTop = 0;
    }

    function renderFilesFolder(collectionId, push) {
        const meta = collectionId === "all"
            ? { id: "all", name: "All Work", tagline: "Every collection" }
            : collectionById(collectionId);
        if (!meta) return;

        if (push !== false) pushNav();

        files.folder = collectionId;
        files.items = collectionId === "all"
            ? ITEMS.slice()
            : ITEMS.filter(function (item) { return item.collection === collectionId; });

        byId("files-title").textContent = meta.name;
        byId("files-content").innerHTML =
            '<div class="section-title" style="margin-top:1rem">' + files.items.length + " items</div>" +
            '<div class="files-grid">' + files.items.map(function (item) {
                return '<button class="files-item" data-files-item="' + esc(item.id) + '">' +
                    '<span class="files-item__thumb">' +
                    '<img src="' + esc(MEDIA_BASE + item.thumb) + '" alt="" loading="lazy" decoding="async">' +
                    (item.type === "video"
                        ? '<span class="files-item__play"><i class="fas fa-play"></i></span>'
                        : "") +
                    "</span>" +
                    '<span class="files-item__name">' + esc(item.title) + "</span>" +
                    "</button>";
            }).join("") + "</div>" +
            '<div class="h-6"></div>';
        byId("files-content").scrollTop = 0;
    }

    /* ------------------------------------------------------------------ viewer */
    function openItem(itemId) {
        const index = files.items.findIndex(function (item) { return item.id === itemId; });
        if (index < 0) return;
        viewerIndex = index;
        renderViewer();
        pushNav();
        byId("media-viewer").classList.add("open");
        byId("media-viewer").setAttribute("aria-hidden", "false");
    }

    function renderViewer() {
        const item = files.items[viewerIndex];
        if (!item) return;

        const meta = collectionById(item.collection);
        const isVideo = item.type === "video";

        byId("viewer-stage").innerHTML = isVideo
            ? '<video src="' + esc(MEDIA_BASE + item.src) + '" poster="' + esc(MEDIA_BASE + item.thumb) +
              '" controls autoplay playsinline></video>'
            : '<img src="' + esc(MEDIA_BASE + item.src) + '" alt="' + esc(item.title) + '">';

        byId("viewer-title").textContent = item.title;
        byId("viewer-sub").textContent =
            (meta ? meta.name : item.collection) + " · " + (item.categories || []).map(function (id) { return CATEGORY_LABELS[id] || id; }).join(" \u00B7 ");
        byId("viewer-count").textContent = (viewerIndex + 1) + " / " + files.items.length;
    }

    function stepViewer(delta) {
        if (viewerIndex < 0 || !files.items.length) return;
        viewerIndex = (viewerIndex + delta + files.items.length) % files.items.length;
        renderViewer();
    }

    function closeViewer() {
        byId("viewer-stage").innerHTML = "";
        byId("media-viewer").classList.remove("open");
        byId("media-viewer").setAttribute("aria-hidden", "true");
        viewerIndex = -1;
    }

    function viewerIsOpen() {
        return byId("media-viewer").classList.contains("open");
    }

    /* ------------------------------------------------------------ app routing */
    function trackRecent(appId) {
        recentOrder = recentOrder.filter(function (id) { return id !== appId; });
        recentOrder.unshift(appId);
        recentOrder = recentOrder.slice(0, MAX_RECENTS);
    }

    function openApp(appId) {
        const app = byId(appId);
        if (!app) return;

        const alreadyOpen = appIsOpen(appId);

        if (appId === HUB_APP) {
            if (!alreadyOpen) {
                renderFilesRoot();
                pushNav();
            }
        } else if (!alreadyOpen) {
            pushNav();
        }

        app.classList.add("open");
        if (stack[stack.length - 1] !== appId) stack.push(appId);
        trackRecent(appId);
    }

    function closeApp(appId) {
        const app = byId(appId);
        if (!app) return;
        app.classList.remove("open");
        const index = stack.lastIndexOf(appId);
        if (index > -1) stack.splice(index, 1);
    }

    function closeOverlays() {
        closeQuickSettings();
        closeRecents();
    }

    function goHome() {
        document.querySelectorAll(".app-window.open").forEach(function (app) {
            app.classList.remove("open");
        });
        closeViewer();
        closeOverlays();
        stack.length = 0;
        files.folder = null;
        resetHistory();
    }

    /* ---------------------------------------------------------------- recents */
    function recentsIsOpen() {
        return byId("recents").classList.contains("open");
    }

    function renderRecents() {
        const list = byId("recents-list");
        if (!recentOrder.length) {
            list.innerHTML = '<div class="recents__empty">No recent apps yet.</div>';
            return;
        }
        list.innerHTML = recentOrder.map(function (appId) {
            const meta = APPS[appId] || { name: appId, icon: "fa-window-maximize", color: "#334155" };
            return '<button class="recents__card" data-recent="' + esc(appId) + '">' +
                '<span class="recents__preview" style="background:' + meta.color + '">' +
                '<i class="fas ' + meta.icon + '"></i></span>' +
                '<span class="recents__name">' + esc(meta.name) + "</span>" +
                "</button>";
        }).join("");
    }

    function openRecents() {
        renderRecents();
        byId("recents").classList.add("open");
        byId("recents").setAttribute("aria-hidden", "false");
    }

    function closeRecents() {
        byId("recents").classList.remove("open");
        byId("recents").setAttribute("aria-hidden", "true");
    }

    function toggleRecents() {
        if (recentsIsOpen()) closeRecents();
        else {
            closeQuickSettings();
            openRecents();
        }
    }

    /* ---------------------------------------------------------- quick settings */
    function qsIsOpen() {
        return byId("quick-settings").classList.contains("open");
    }

    function openQuickSettings() {
        closeRecents();
        byId("quick-settings").classList.add("open");
        byId("quick-settings").setAttribute("aria-hidden", "false");
    }

    function closeQuickSettings() {
        byId("quick-settings").classList.remove("open");
        byId("quick-settings").setAttribute("aria-hidden", "true");
    }

    /* ------------------------------------------------------------------ events */
    document.addEventListener("click", function (event) {
        const opener = event.target.closest("[data-open]");
        if (opener) {
            openApp(opener.dataset.open);
            return;
        }

        const closer = event.target.closest("[data-close]");
        if (closer) {
            requestBack();
            return;
        }

        const folder = event.target.closest("[data-files-folder]");
        if (folder) {
            renderFilesFolder(folder.dataset.filesFolder);
            return;
        }

        const item = event.target.closest("[data-files-item]");
        if (item) {
            openItem(item.dataset.filesItem);
            return;
        }

        const recent = event.target.closest("[data-recent]");
        if (recent) {
            closeRecents();
            openApp(recent.dataset.recent);
            return;
        }

        const toggle = event.target.closest("[data-toggle]");
        if (toggle) {
            toggle.classList.toggle("is-on");
        }
    });

    const backButton = byId("nav-back");
    const homeButton = byId("nav-home");
    const recentsButton = byId("nav-recents");
    const filesBack = byId("files-back");
    const viewerClose = byId("viewer-close");
    const viewerPrev = byId("viewer-prev");
    const viewerNext = byId("viewer-next");
    const recentsClear = byId("recents-clear");

    if (backButton) backButton.addEventListener("click", requestBack);
    if (homeButton) homeButton.addEventListener("click", goHome);
    if (recentsButton) recentsButton.addEventListener("click", toggleRecents);
    if (filesBack) filesBack.addEventListener("click", requestBack);
    if (viewerClose) viewerClose.addEventListener("click", requestBack);
    if (viewerPrev) viewerPrev.addEventListener("click", function () { stepViewer(-1); });
    if (viewerNext) viewerNext.addEventListener("click", function () { stepViewer(1); });

    if (recentsClear) {
        recentsClear.addEventListener("click", function () {
            recentOrder = [];
            renderRecents();
            goHome();
        });
    }

    /* tap outside the quick-settings sheet closes it */
    const qs = byId("quick-settings");
    if (qs) {
        qs.addEventListener("click", function (event) {
            if (event.target === qs) closeQuickSettings();
        });
    }

    const brightness = byId("qs-brightness");
    const brightnessValue = byId("qs-brightness-value");
    if (brightness) {
        brightness.addEventListener("input", function () {
            if (brightnessValue) brightnessValue.textContent = brightness.value + "%";
            const surface = byId("screen");
            if (surface) surface.style.filter = "brightness(" + (brightness.value / 100) + ")";
        });
    }

    /* swipe between items in the viewer */
    let touchStartX = 0;
    const stage = byId("viewer-stage");
    if (stage) {
        stage.addEventListener("touchstart", function (event) {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        stage.addEventListener("touchend", function (event) {
            const dx = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) < 60) return;
            stepViewer(dx < 0 ? 1 : -1);
        }, { passive: true });
    }

    /* ------------------------------------------------------------ edge gestures */
    const screen = byId("screen");
    const pill = byId("gesture-pill");
    let gesture = null;

    if (screen) {
        screen.addEventListener("touchstart", function (event) {
            if (event.touches.length !== 1) return;
            const touch = event.touches[0];
            const rect = screen.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            let zone = null;
            if (y < 36) zone = "top";
            else if (y > rect.height - 100) zone = "bottom";
            else if (x < 26) zone = "left";
            else if (x > rect.width - 26) zone = "right";
            if (!zone) return;

            gesture = { zone: zone, x: x, y: y, start: Date.now() };
        }, { passive: true });

        screen.addEventListener("touchmove", function (event) {
            if (!gesture || gesture.zone !== "bottom") return;
            const touch = event.touches[0];
            const dy = touch.clientY - screen.getBoundingClientRect().top - gesture.y;
            if (dy < -12 && pill) {
                pill.classList.add("is-dragging");
                pill.style.width = Math.min(148, 110 + Math.abs(dy) * 0.35) + "px";
            }
        }, { passive: true });

        screen.addEventListener("touchend", function (event) {
            if (!gesture) return;
            const touch = event.changedTouches[0];
            const rect = screen.getBoundingClientRect();
            const dx = touch.clientX - rect.left - gesture.x;
            const dy = touch.clientY - rect.top - gesture.y;
            const held = Date.now() - gesture.start;
            const g = gesture;
            gesture = null;

            if (pill) {
                pill.classList.remove("is-dragging");
                pill.style.width = "";
            }

            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (g.zone === "bottom" && dy < -70 && absY > absX) {
                if (held > 320) toggleRecents();
                else goHome();
                return;
            }
            if (g.zone === "top" && dy > 60 && absY > absX) {
                openQuickSettings();
                return;
            }
            if (g.zone === "left" && dx > 60 && absX > absY) {
                requestBack();
                return;
            }
            if (g.zone === "right" && dx < -60 && absX > absY) {
                requestBack();
            }
        }, { passive: true });
    }

    /* ------------------------------------------------------------------ keys */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (qsIsOpen()) closeQuickSettings();
            else if (recentsIsOpen()) closeRecents();
            else if (viewerIsOpen()) requestBack();
            else goHome();
            return;
        }
        if (viewerIsOpen() && event.key === "ArrowRight") stepViewer(1);
        if (viewerIsOpen() && event.key === "ArrowLeft") stepViewer(-1);
        if (event.key === "Backspace" && !event.target.matches("input, textarea, input[type=range]")) {
            event.preventDefault();
            requestBack();
        }
    });

    /* -------------------------------------------------------------------- boot */
    history.replaceState({ nav: 0 }, "");
    updateTime();
    window.setInterval(updateTime, 1000);

    renderFilesRoot();
})();
