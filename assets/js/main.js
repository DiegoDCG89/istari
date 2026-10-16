import { safeCreateIcons } from './ui/icons.js';
import { initMobileMenu } from './ui/mobileMenu.js';
import { initAmbientCanvas } from './canvas/ambient.js';
import { initContactForm } from './features/contactForm.js';

safeCreateIcons();
initMobileMenu();
initAmbientCanvas();
initContactForm();
