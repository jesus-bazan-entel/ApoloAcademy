import { Workbox } from 'workbox-window';

// Verificar si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
    // Registrar el service worker
    const wb = new Workbox('/service-worker.js');

    wb.addEventListener('waiting', (event) => {
        // Hay una nueva versión disponible
        if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });
            wb.messageSkipWaiting();
        }
    });

    wb.register().then(() => {
        console.log('Service Worker registrado exitosamente');
    }).catch((error) => {
        console.error('Error al registrar Service Worker:', error);
    });
}

// Detectar si la app está instalada
export const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
};

// Detectar si es un dispositivo móvil
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detectar tipo de dispositivo
export const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
        return 'tablet';
    } else if (/Mobile|Android|iPhone/i.test(userAgent)) {
        return 'mobile';
    } else {
        return 'desktop';
    }
};

// Optimizar para dispositivos móviles
export const optimizeForMobile = () => {
    if (isMobile()) {
        // Ajustar viewport para móviles
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }

        // Prevenir zoom en inputs
        document.addEventListener('touchstart', function preventZoom(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
};

// Inicializar optimizaciones
optimizeForMobile();
