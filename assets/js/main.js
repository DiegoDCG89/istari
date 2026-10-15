import { safeCreateIcons } from './ui/icons.js';
import { initSound } from './ui/sound.js';
import { initMobileMenu } from './ui/mobileMenu.js';
import { initAmbientCanvas } from './canvas/ambient.js';
import { initCrystalCanvas } from './canvas/crystal.js';
import { initContactForm } from './features/contactForm.js';

safeCreateIcons();
initSound();
initMobileMenu();
initAmbientCanvas();
initCrystalCanvas();
initContactForm();
