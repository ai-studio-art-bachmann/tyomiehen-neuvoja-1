
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update banner
              showUpdateBanner(registration);
            }
          });
        }
      });
      
      // Also check for updates on page load
      checkForUpdates(registration);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Check for updates on page load
const checkForUpdates = async (registration: ServiceWorkerRegistration) => {
  try {
    const updated = await registration.update();
    console.log('Service Worker update check complete:', updated);
  } catch (error) {
    console.error('Service Worker update check failed:', error);
  }
};

// Show update banner with working update button
const showUpdateBanner = (registration: ServiceWorkerRegistration) => {
  const updateBanner = document.createElement('div');
  updateBanner.style.position = 'fixed';
  updateBanner.style.bottom = '0';
  updateBanner.style.left = '0';
  updateBanner.style.right = '0';
  updateBanner.style.backgroundColor = '#ea580c';
  updateBanner.style.color = 'white';
  updateBanner.style.padding = '12px';
  updateBanner.style.display = 'flex';
  updateBanner.style.justifyContent = 'space-between';
  updateBanner.style.alignItems = 'center';
  updateBanner.style.zIndex = '1000';
  
  const message = document.createElement('div');
  message.textContent = 'Uusi versio on saatavilla!';
  
  const updateButton = document.createElement('button');
  updateButton.textContent = 'Päivitä nyt';
  updateButton.style.backgroundColor = 'white';
  updateButton.style.color = '#ea580c';
  updateButton.style.border = 'none';
  updateButton.style.borderRadius = '4px';
  updateButton.style.padding = '8px 12px';
  updateButton.style.cursor = 'pointer';
  
  updateButton.addEventListener('click', () => {
    // Skip the waiting worker and reload the page
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  });
  
  updateBanner.appendChild(message);
  updateBanner.appendChild(updateButton);
  document.body.appendChild(updateBanner);
};

export const showInstallPrompt = () => {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
          installButton.style.display = 'none';
        }
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
};

export const checkOnlineStatus = () => {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log('Connection status:', status);
    
    // Show/hide offline indicator
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = navigator.onLine ? 'none' : 'block';
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
};
