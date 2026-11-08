/* ==========================================================================
   Portfolio OS — desktop shell
   ========================================================================== */

(function () {
    "use strict";

    // Everything is served from one origin now, so media paths stay relative.
    const MEDIA_BASE = "";
    const CV_URL = "https://drive.google.com/file/d/1sSdM1iGMYrdMkZ7Ih7baob9H2BcVGsQ7/view";

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
        const style = COLLECTION_STYLE[collection.id] || { icon: "fa-folder", color: "#6b7280" };
        return Object.assign({}, collection, style, {
            count: ITEMS.filter(function (item) { return item.collection === collection.id; }).length,
        });
    });

    const ALL_WORK = {
        id: "all",
        name: "All Work",
        tagline: "Every collection",
        icon: "fa-layer-group",
        color: "#525252",
        count: ITEMS.length,
    };

    const APPS = [
        { id: "about", label: "About Me", icon: "fa-user", color: "#3b82f6", window: "about" },
        { id: "experience", label: "Experience", icon: "fa-briefcase", color: "#f59e0b", window: "experience" },
        { id: "projects", label: "Projects", icon: "fa-folder-open", color: "#eab308", window: "projects" },
        { id: "contact", label: "Contact Me", icon: "fa-envelope", color: "#10b981", window: "contact" },
        { id: "cv", label: "My CV", icon: "fa-file-pdf", color: "#ef4444", href: CV_URL },
        { id: "game", label: "Aditya's Western World", icon: "fa-hat-cowboy", color: "#b45309", href: "game.html" },
        { id: "navy", label: "World of Navy", icon: "fa-anchor", color: "#0ea5e9", href: "worldofnavy/play.html" },
        { id: "viewer", label: "Preview", icon: "fa-image", color: "#2563eb", window: "viewer", hidden: true },
    ];

    const WEBSITES = [
        { name: "adityaanamta.vercel.app", url: "https://adityaanamta.vercel.app", icon: "fa-user-astronaut", color: "#2563eb", desc: "This portfolio OS" },
        { name: "cakralabs.me", url: "https://cakralabs.me", icon: "fa-robot", color: "#111827", desc: "Cakra Labs agency site" },
        { name: "myuang.vercel.app", url: "https://myuang.vercel.app", icon: "fa-wallet", color: "#2563eb", desc: "Personal finance tracker" },
        { name: "evpowering.vercel.app", url: "https://evpowering.vercel.app", icon: "fa-charging-station", color: "#16a34a", desc: "EV charging landing page" },
        { name: "rotiklasik.vercel.app", url: "https://rotiklasik.vercel.app", icon: "fa-bread-slice", color: "#b45309", desc: "Bakery brand showcase" },
        { name: "ptsbmgroup.github.io", url: "https://ptsbmgroup.github.io", icon: "fa-building-columns", color: "#0891b2", desc: "SBM Group corporate site" },
    ];

    /* ---------------------------------------------------------------- helpers */
    function el(id) {
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

    function mediaUrl(path) {
        return MEDIA_BASE + path;
    }

    function icon(name, color) {
        return '<span class="desktop-icon__tile" style="background:' + color + '"><i class="fas ' + name + '"></i></span>';
    }

    /* --------------------------------------------------------- desktop icons */
    function renderDesktopIcons() {
        const container = el("desktop-icons");
        container.innerHTML = APPS.filter(function (app) {
            return !app.hidden;
        }).map(function (app) {
            if (app.href) {
                return '<a class="desktop-icon" href="' + app.href + '"' +
                    (app.href.indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "") + '>' +
                    icon(app.icon, app.color) +
                    '<span class="desktop-icon__label">' + app.label + "</span></a>";
            }
            return '<button class="desktop-icon" data-open="' + app.id + '">' +
                icon(app.icon, app.color) +
                '<span class="desktop-icon__label">' + app.label + "</span></button>";
        }).join("");
    }

    function renderStartMenu() {
        const windows = APPS.filter(function (app) { return app.window && !app.hidden; });
        const tiles = windows.map(function (app) {
            return '<button class="start-tile" data-open="' + app.id + '">' +
                '<i class="fas ' + app.icon + '" style="color:' + app.color + '"></i>' +
                "<span>" + app.label + "</span></button>";
        }).join("");

        const recent = [
            { id: "experience", icon: "fa-file-lines", color: "#60a5fa", label: "Experience.txt" },
            { id: "projects", icon: "fa-folder-open", color: "#fbbf24", label: "Projects" },
            { id: "cv", icon: "fa-file-pdf", color: "#f87171", label: "CV Aditya Putra Anamta" },
        ].map(function (item) {
            return '<div class="start-recent" data-open="' + item.id + '">' +
                '<i class="fas ' + item.icon + '" style="color:' + item.color + '"></i>' +
                "<span>" + item.label + "</span></div>";
        }).join("");

        el("start-menu").innerHTML =
            '<div class="start-menu__body">' +
            '<div class="start-menu__rail">' +
            '<button title="Settings"><i class="fas fa-cog"></i></button>' +
            '<button title="Power"><i class="fas fa-power-off"></i></button>' +
            "</div>" +
            '<div class="start-menu__apps">' +
            '<div class="start-menu__title">Pinned</div>' +
            '<div class="start-grid">' + tiles + "</div>" +
            '<div class="start-menu__title" style="margin-top:1rem">Recent</div>' +
            recent +
            "</div></div>";
    }

    /* --------------------------------------------------------------- windows */
    const state = {
        open: new Set(),
        active: null,
        maxZ: 20,
        drag: null,
        resize: null,
    };

    function appById(id) {
        return APPS.find(function (app) { return app.id === id; }) || null;
    }

    function openWindow(appId) {
        const app = appById(appId);
        if (!app) return;
        if (app.href) {
            window.open(app.href, "_blank", "noopener");
            return;
        }
        const win = el("window-" + app.window);
        if (!win) return;

        if (win.classList.contains("is-open") && state.open.has(appId)) {
            bringToFront(appId);
            return;
        }

        win.classList.add("is-open");
        if (!state.open.has(appId)) {
            const offset = state.open.size * 24;
            const width = win.offsetWidth || 520;
            const height = win.offsetHeight || 480;
            win.style.left = Math.max(24, Math.min(90 + offset, window.innerWidth - width - 40)) + "px";
            win.style.top = Math.max(24, Math.min(60 + offset, window.innerHeight - height - 70)) + "px";
        }
        state.open.add(appId);
        bringToFront(appId);
    }

    function closeWindow(appId) {
        const win = el("window-" + appId);
        if (!win) return;
        win.classList.remove("is-open", "is-maximized");
        if (appId === "viewer") {
            const content = el("viewer-content");
            if (content) content.innerHTML = "";
            viewer.index = -1;
        }
        state.open.delete(appId);
        if (state.active === appId) state.active = null;
        renderTaskbar();
    }

    function minimizeWindow(appId) {
        const win = el("window-" + appId);
        if (!win) return;
        win.classList.remove("is-open");
        if (state.active === appId) state.active = null;
        renderTaskbar();
    }

    function toggleMaximize(appId) {
        const win = el("window-" + appId);
        if (!win) return;
        win.classList.toggle("is-maximized");
    }

    function bringToFront(appId) {
        const win = el("window-" + appId);
        if (!win) return;
        state.maxZ += 1;
        win.style.zIndex = String(state.maxZ);
        state.active = appId;
        renderTaskbar();
    }

    function renderTaskbar() {
        const container = el("taskbar-apps");
        if (!container) return;
        container.innerHTML = APPS.filter(function (app) {
            return app.window && state.open.has(app.id);
        }).map(function (app) {
            const win = el("window-" + app.window);
            const isOpen = win && win.classList.contains("is-open");
            const classes = "taskbar-app" + (isOpen ? " is-open" : "") +
                (state.active === app.id ? " is-active" : "");
            return '<button class="' + classes + '" data-task="' + app.id + '" title="' + esc(app.label) + '">' +
                '<i class="fas ' + app.icon + '"></i></button>';
        }).join("");
    }

    /* ------------------------------------------------------------ start menu */
    function toggleStartMenu() {
        const menu = el("start-menu");
        menu.classList.toggle("is-open");
    }

    /* ----------------------------------------------------------- drag/resize */
    function startDrag(event, appId) {
        if (event.target.closest("button")) return;
        const win = el("window-" + appId);
        if (!win || win.classList.contains("is-maximized")) return;

        const rect = win.getBoundingClientRect();
        state.drag = {
            appId: appId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };
        win.classList.add("is-dragging");
        bringToFront(appId);
    }

    function startResize(event, appId, direction) {
        event.stopPropagation();
        const win = el("window-" + appId);
        if (!win || win.classList.contains("is-maximized")) return;

        const rect = win.getBoundingClientRect();
        state.resize = {
            appId: appId,
            direction: direction,
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            mouseX: event.clientX,
            mouseY: event.clientY,
        };
        win.classList.add("is-resizing");
        bringToFront(appId);
    }

    document.addEventListener("mousemove", function (event) {
        if (state.drag) {
            event.preventDefault();
            const win = el("window-" + state.drag.appId);
            if (!win) return;
            const width = win.offsetWidth;
            let x = event.clientX - state.drag.offsetX;
            let y = event.clientY - state.drag.offsetY;

            x = Math.min(Math.max(x, 40 - width), window.innerWidth - 40);
            y = Math.max(0, Math.min(y, window.innerHeight - 70));

            win.style.left = x + "px";
            win.style.top = y + "px";
            return;
        }

        if (state.resize) {
            event.preventDefault();
            const win = el("window-" + state.resize.appId);
            if (!win) return;
            const resize = state.resize;
            const dx = event.clientX - resize.mouseX;
            const dy = event.clientY - resize.mouseY;

            let width = resize.width;
            let height = resize.height;
            let left = resize.left;
            let top = resize.top;

            if (resize.direction.indexOf("e") > -1) width = resize.width + dx;
            if (resize.direction.indexOf("s") > -1) height = resize.height + dy;
            if (resize.direction.indexOf("w") > -1) {
                width = resize.width - dx;
                left = resize.left + dx;
            }
            if (resize.direction.indexOf("n") > -1) {
                height = resize.height - dy;
                top = resize.top + dy;
            }

            if (width < 320) {
                if (resize.direction.indexOf("w") > -1) left = resize.left + resize.width - 320;
                width = 320;
            }
            if (height < 220) {
                if (resize.direction.indexOf("n") > -1) top = resize.top + resize.height - 220;
                height = 220;
            }
            if (top < 0) {
                height += top;
                top = 0;
            }

            win.style.width = width + "px";
            win.style.height = height + "px";
            win.style.left = left + "px";
            win.style.top = top + "px";
        }
    });

    document.addEventListener("mouseup", function () {
        if (state.drag) {
            const win = el("window-" + state.drag.appId);
            if (win) win.classList.remove("is-dragging");
            state.drag = null;
        }
        if (state.resize) {
            const win = el("window-" + state.resize.appId);
            if (win) win.classList.remove("is-resizing");
            state.resize = null;
        }
    });

    /* ---------------------------------------------------------- file explorer */
    const explorer = {
        view: "root",       // root | collection | websites
        collectionId: null,
        query: "",
    };

    let currentItems = [];
    const viewer = { index: -1 };

    function collectionMeta(id) {
        if (id === "all") return ALL_WORK;
        return COLLECTIONS.find(function (c) { return c.id === id; }) || ALL_WORK;
    }

    function itemsIn(collectionId) {
        if (collectionId === "all") return ITEMS.slice();
        return ITEMS.filter(function (item) { return item.collection === collectionId; });
    }

    function folderCard(meta, attribute) {
        return '<button class="folder-card" ' + attribute + '="' + meta.id + '">' +
            '<span class="folder-card__icon" style="color:' + meta.color + '"><i class="fas ' + meta.icon + '"></i></span>' +
            '<span class="folder-card__name">' + esc(meta.name) + "</span>" +
            '<span class="folder-card__meta">' + meta.count + " items" +
            (meta.tagline ? " · " + esc(meta.tagline) : "") + "</span>" +
            "</button>";
    }

    function itemCard(item) {
        const isVideo = item.type === "video";
        return '<button class="item-card" data-item="' + esc(item.id) + '" title="' + esc(item.title) + '">' +
            '<span class="item-card__thumb">' +
            '<img src="' + esc(mediaUrl(item.thumb)) + '" alt="" loading="lazy" decoding="async">' +
            (isVideo ? '<span class="item-card__play"><i class="fas fa-play"></i></span>' : "") +
            "</span>" +
            '<span class="item-card__name">' + esc(item.title) + "</span>" +
            "</button>";
    }

    function renderExplorer() {
        const main = el("explorer-main");
        const breadcrumb = el("explorer-breadcrumb");
        if (!main || !breadcrumb) return;

        const searchInput = el("explorer-search");
        if (searchInput && searchInput.value.trim().toLowerCase() !== explorer.query) {
            searchInput.value = explorer.query;
        }

        /* search mode overrides the current folder */
        if (explorer.query) {
            currentItems = ITEMS.filter(function (item) {
                return item.title.toLowerCase().indexOf(explorer.query) > -1;
            });
            breadcrumb.textContent = "This PC > Search: “" + explorer.query + "”";
            main.innerHTML =
                '<div class="view-label"><span>Search results (' + currentItems.length + ")</span>" +
                "<span>" + (currentItems.length ? "Click to preview" : "No match") + "</span></div>" +
                (currentItems.length
                    ? '<div class="item-grid">' + currentItems.map(itemCard).join("") + "</div>"
                    : '<div class="explorer-empty"><i class="fas fa-magnifying-glass"></i><p>No work matches that search.</p></div>');
            updateSidebar();
            return;
        }

        if (explorer.view === "websites") {
            breadcrumb.textContent = "This PC > Projects > Websites";
            currentItems = [];
            main.innerHTML =
                '<div class="view-label"><span>Websites (' + WEBSITES.length + ")</span><span>Live links</span></div>" +
                '<div class="website-list">' + WEBSITES.map(function (site) {
                    return '<a class="link-row" href="' + site.url + '" target="_blank" rel="noopener">' +
                        '<span class="link-row__icon" style="background:' + site.color + '"><i class="fas ' + site.icon + '"></i></span>' +
                        "<span><h4>" + esc(site.name) + "</h4><p>" + esc(site.desc) + "</p></span></a>";
                }).join("") + "</div>";
            updateSidebar();
            return;
        }

        if (explorer.view === "collection" && explorer.collectionId) {
            const meta = collectionMeta(explorer.collectionId);
            currentItems = itemsIn(explorer.collectionId);
            breadcrumb.textContent = "This PC > Projects > " + meta.name;

            main.innerHTML =
                '<div class="explorer-collection-head">' +
                '<div><h3>' + esc(meta.name) + "</h3>" +
                "<p>" + esc(meta.tagline || "") + "</p></div>" +
                '<span class="explorer-collection-count">' + currentItems.length + " items</span>" +
                "</div>" +
                '<div class="view-label"><span>' + esc(meta.role || "") + "</span>" +
                "<span>" + categorySummary(currentItems) + "</span></div>" +
                '<div class="item-grid">' + currentItems.map(itemCard).join("") + "</div>";
            updateSidebar();
            return;
        }

        /* root */
        currentItems = [];
        breadcrumb.textContent = "This PC > Projects";
        main.innerHTML =
            '<div class="view-label"><span>Collections (' + (COLLECTIONS.length + 1) + ")</span><span>Click a folder to open</span></div>" +
            '<div class="folder-grid">' +
            COLLECTIONS.map(function (collection) {
                return folderCard(collection, "data-folder");
            }).join("") +
            folderCard(ALL_WORK, "data-folder") +
            '<button class="folder-card" data-explorer="websites">' +
            '<span class="folder-card__icon" style="color:#3b82f6"><i class="fas fa-globe"></i></span>' +
            '<span class="folder-card__name">Websites</span>' +
            '<span class="folder-card__meta">' + WEBSITES.length + " items · Live sites</span>" +
            "</button></div>";
        updateSidebar();
    }

    function categorySummary(items) {
        const counts = {};
        items.forEach(function (item) {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return Object.keys(CATEGORY_LABELS)
            .filter(function (key) { return counts[key]; })
            .map(function (key) { return CATEGORY_LABELS[key] + " " + counts[key]; })
            .join(" · ");
    }

    function updateSidebar() {
        document.querySelectorAll(".explorer-sidebar__item[data-folder]").forEach(function (node) {
            node.classList.toggle("is-active",
                explorer.view === "collection" && explorer.collectionId === node.dataset.folder);
        });
        document.querySelectorAll('.explorer-sidebar__item[data-explorer="websites"]').forEach(function (node) {
            node.classList.toggle("is-active", explorer.view === "websites");
        });
    }

    function openFolder(collectionId) {
        explorer.view = "collection";
        explorer.collectionId = collectionId;
        explorer.query = "";
        renderExplorer();
    }

    function openRoot() {
        explorer.view = "root";
        explorer.collectionId = null;
        explorer.query = "";
        renderExplorer();
    }

    /* ------------------------------------------------------------- viewer */
    function openViewer(itemId) {
        const index = currentItems.findIndex(function (item) { return item.id === itemId; });
        if (index < 0) return;
        viewer.index = index;

        const win = el("window-viewer");
        if (!win) return;

        const firstOpen = !state.open.has("viewer");
        win.classList.add("is-open");
        state.open.add("viewer");
        if (firstOpen) {
            const width = win.offsetWidth || 900;
            win.style.left = Math.max(20, Math.round((window.innerWidth - width) / 2)) + "px";
            win.style.top = "64px";
        }
        renderViewer();
        bringToFront("viewer");
    }

    function renderViewer() {
        const item = currentItems[viewer.index];
        if (!item) return;

        const meta = collectionMeta(item.collection);
        const isVideo = item.type === "video";

        el("viewer-title").textContent = item.title;
        el("viewer-icon").className = "fas " + (isVideo ? "fa-film" : "fa-image") + " text-blue-500";

        const stage = isVideo
            ? '<video src="' + esc(mediaUrl(item.src)) + '" poster="' + esc(mediaUrl(item.thumb)) +
              '" controls autoplay playsinline></video>'
            : '<img src="' + esc(mediaUrl(item.src)) + '" alt="' + esc(item.title) + '">';

        el("viewer-content").innerHTML =
            '<div class="viewer-stage">' + stage + "</div>" +
            '<div class="viewer-caption">' +
            '<span class="viewer-caption__title">' + esc(meta.name) + " · " +
            esc(CATEGORY_LABELS[item.category] || item.category) + "</span>" +
            '<span class="viewer-caption__meta">' + (viewer.index + 1) + " / " + currentItems.length +
            " · ← → to browse</span>" +
            "</div>";
    }

    function stepViewer(delta) {
        if (viewer.index < 0 || !currentItems.length) return;
        viewer.index = (viewer.index + delta + currentItems.length) % currentItems.length;
        renderViewer();
    }

    /* --------------------------------------------------------------- events */
    document.addEventListener("click", function (event) {
        const opener = event.target.closest("[data-open]");
        if (opener) {
            openWindow(opener.dataset.open);
            const menu = el("start-menu");
            if (menu.classList.contains("is-open")) toggleStartMenu();
            return;
        }

        const closer = event.target.closest("[data-close]");
        if (closer) {
            closeWindow(closer.dataset.close);
            return;
        }

        const minimizer = event.target.closest("[data-minimize]");
        if (minimizer) {
            minimizeWindow(minimizer.dataset.minimize);
            return;
        }

        const maximizer = event.target.closest("[data-maximize]");
        if (maximizer) {
            toggleMaximize(maximizer.dataset.maximize);
            return;
        }

        const folder = event.target.closest("[data-folder]");
        if (folder) {
            openFolder(folder.dataset.folder);
            return;
        }

        const viewTarget = event.target.closest("[data-explorer]");
        if (viewTarget) {
            if (viewTarget.dataset.explorer === "websites") {
                explorer.view = "websites";
                explorer.collectionId = null;
                explorer.query = "";
                renderExplorer();
            } else {
                openRoot();
            }
            return;
        }

        const item = event.target.closest("[data-item]");
        if (item) {
            openViewer(item.dataset.item);
            return;
        }

        const task = event.target.closest("[data-task]");
        if (task) {
            const appId = task.dataset.task;
            const win = el("window-" + (appById(appId) || {}).window);
            if (!win) return;
            if (!win.classList.contains("is-open")) {
                win.classList.add("is-open");
                bringToFront(appId);
            } else if (state.active === appId) {
                minimizeWindow(appId);
            } else {
                bringToFront(appId);
            }
        }
    });

    document.addEventListener("click", function (event) {
        const menu = el("start-menu");
        if (!menu.classList.contains("is-open")) return;
        if (event.target.closest("#start-menu") || event.target.closest("[data-start]")) return;
        menu.classList.remove("is-open");
    });

    /* ------------------------------------------------------------------ clock */
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const date = now.toLocaleDateString([], { month: "2-digit", day: "2-digit", year: "numeric" });
        const timeNode = el("clock-time");
        const dateNode = el("clock-date");
        if (timeNode) timeNode.textContent = time;
        if (dateNode) dateNode.textContent = date;
    }

    /* ------------------------------------------------------------- bootstrap */
    function boot() {
        renderDesktopIcons();
        renderStartMenu();
        renderTaskbar();
        renderExplorer();
        updateClock();
        window.setInterval(updateClock, 1000);

        document.querySelectorAll("[data-drag]").forEach(function (bar) {
            bar.addEventListener("mousedown", function (event) {
                startDrag(event, bar.dataset.drag);
            });
        });

        document.querySelectorAll("[data-resize]").forEach(function (handle) {
            handle.addEventListener("mousedown", function (event) {
                startResize(event, handle.dataset.resize, handle.dataset.dir);
            });
        });

        const back = el("explorer-back");
        const up = el("explorer-up");
        if (back) back.addEventListener("click", openRoot);
        if (up) up.addEventListener("click", openRoot);

        const search = el("explorer-search");
        if (search) {
            search.addEventListener("input", function () {
                explorer.query = search.value.trim().toLowerCase();
                renderExplorer();
            });
            search.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    search.value = "";
                    explorer.query = "";
                    renderExplorer();
                }
            });
        }

        const prev = el("viewer-prev");
        const next = el("viewer-next");
        if (prev) prev.addEventListener("click", function () { stepViewer(-1); });
        if (next) next.addEventListener("click", function () { stepViewer(1); });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                const menu = el("start-menu");
                if (menu.classList.contains("is-open")) {
                    menu.classList.remove("is-open");
                    return;
                }
                if (state.active === "viewer") {
                    closeWindow("viewer");
                    return;
                }
                if (state.active) minimizeWindow(state.active);
                return;
            }

            if (state.active === "viewer" && viewer.index > -1) {
                if (event.key === "ArrowRight") stepViewer(1);
                if (event.key === "ArrowLeft") stepViewer(-1);
            }
        });

        const startButton = el("start-button");
        if (startButton) {
            startButton.addEventListener("click", toggleStartMenu);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
