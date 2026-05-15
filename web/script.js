// Gestion de la sidebar mobile
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebar = document.getElementById('mobile-sidebar');
const overlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('sidebar-open');
    sidebarToggle.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('sidebar-open');
    sidebarToggle.setAttribute('aria-expanded', 'false');
}

if (sidebarToggle && sidebar && overlay) {
    sidebarToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}
