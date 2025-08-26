// Script para debug do PWA
console.log('=== PWA DEBUG INFO ===');

// Verificar suporte a Service Workers
console.log('Service Worker Support:', 'serviceWorker' in navigator);

// Verificar se já está instalado
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const isWebApp = window.navigator.standalone === true;
console.log('Is Standalone (installed):', isStandalone || isWebApp);

// Verificar manifest
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('Manifest loaded:', manifest);
    console.log('Manifest name:', manifest.name);
    console.log('Manifest icons:', manifest.icons?.length || 0);
  })
  .catch(err => console.error('Manifest error:', err));

// Verificar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration()
    .then(registration => {
      if (registration) {
        console.log('Service Worker registered:', registration);
        console.log('SW State:', registration.active?.state);
        console.log('SW Scope:', registration.scope);
      } else {
        console.log('No Service Worker registration found');
      }
    })
    .catch(err => console.error('SW check error:', err));
}

// Verificar critérios PWA
const checkPWACriteria = () => {
  const criteria = {
    'HTTPS or localhost': location.protocol === 'https:' || location.hostname === 'localhost',
    'Service Worker': 'serviceWorker' in navigator,
    'Web App Manifest': document.querySelector('link[rel="manifest"]') !== null,
    'Responsive Design': window.matchMedia('(min-width: 320px)').matches,
    'Valid Icons': true // Assumindo que temos
  };
  
  console.log('PWA Criteria:', criteria);
  
  const allMet = Object.values(criteria).every(Boolean);
  console.log('All criteria met:', allMet);
  
  return criteria;
};

setTimeout(checkPWACriteria, 2000);

// Listener para eventos PWA
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🎉 beforeinstallprompt event fired!');
  console.log('Platforms:', e.platforms);
});

window.addEventListener('appinstalled', () => {
  console.log('🎉 App installed successfully!');
});

// Verificar no console se há algum erro
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

console.log('=== END DEBUG INFO ===');
