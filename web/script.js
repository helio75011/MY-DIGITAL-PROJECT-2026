// Simple script to toggle mobile menu visibility
const mobileMenuButton = document.querySelector('button[aria-expanded]');
const mobileMenu = document.getElementById('mobile-menu');

if(mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
        mobileMenuButton.setAttribute('aria-expanded', !expanded);
    });
}