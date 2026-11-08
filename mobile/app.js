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
        motion: "Motion",
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

    const stack = [];
    const files = { folder: null, items: [] };
    let viewerIndex = -1;

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

    /* ------------------------------------------------------------------ clock */
    function updateTime() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
        const date = now.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });

        const clock = byId("clock");
        const widgetTime = byId("widget-time");
        const widgetDate = byId("widget-date");

        if (clock) clock.textContent = time;
        if (widgetTime) widgetTime.textContent = time.replace(":", ".");
        if (widgetDate) widgetDate.textContent = date;
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

    function renderFilesFolder(collectionId) {
        const meta = collectionId === "all"
            ? { id: "all", name: "All Work", tagline: "Every collection" }
            : collectionById(collectionId);
        if (!meta) return;

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
            (meta ? meta.name : item.collection) + " · " + (CATEGORY_LABELS[item.category] || item.category);
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
    function openApp(appId) {
        const app = byId(appId);
        if (!app) return;
        if (appId === "app-projects") renderFilesRoot();
        app.classList.add("open");
        if (stack[stack.length - 1] !== appId) stack.push(appId);
    }

    function closeApp(appId) {
        const app = byId(appId);
        if (!app) return;
        app.classList.remove("open");
        const index = stack.lastIndexOf(appId);
        if (index > -1) stack.splice(index, 1);
    }

    function goHome() {
        document.querySelectorAll(".app-window.open").forEach(function (app) {
            app.classList.remove("open");
        });
        closeViewer();
        stack.length = 0;
    }

    function goBack() {
        if (viewerIsOpen()) {
            closeViewer();
            return;
        }
        if (files.folder && byId("app-projects").classList.contains("open")) {
            renderFilesRoot();
            return;
        }
        const last = stack.pop();
        if (last) {
            const app = byId(last);
            if (app) app.classList.remove("open");
            return;
        }
        goHome();
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
            closeApp(closer.dataset.close);
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
        }
    });

    const menuButton = byId("nav-menu");
    const homeButton = byId("nav-home");
    const backButton = byId("nav-back");
    const filesBack = byId("files-back");
    const viewerClose = byId("viewer-close");
    const viewerPrev = byId("viewer-prev");
    const viewerNext = byId("viewer-next");

    if (menuButton) menuButton.addEventListener("click", function () { openApp("app-projects"); });
    if (homeButton) homeButton.addEventListener("click", goHome);
    if (backButton) backButton.addEventListener("click", goBack);

    if (filesBack) {
        filesBack.addEventListener("click", function () {
            if (files.folder) renderFilesRoot();
            else closeApp("app-projects");
        });
    }

    if (viewerClose) viewerClose.addEventListener("click", closeViewer);
    if (viewerPrev) viewerPrev.addEventListener("click", function () { stepViewer(-1); });
    if (viewerNext) viewerNext.addEventListener("click", function () { stepViewer(1); });

    /* swipe between items */
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

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (viewerIsOpen()) closeViewer();
            else goHome();
        }
        if (viewerIsOpen() && event.key === "ArrowRight") stepViewer(1);
        if (viewerIsOpen() && event.key === "ArrowLeft") stepViewer(-1);
        if (event.key === "Backspace" && !event.target.matches("input, textarea")) {
            event.preventDefault();
            goBack();
        }
    });

    /* -------------------------------------------------------------------- boot */
    updateTime();
    window.setInterval(updateTime, 1000);

    renderFilesRoot();
})();
