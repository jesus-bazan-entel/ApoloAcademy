import { useState } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const dismissNotification = () => {
        setNotification(null);
    };

    const NotificationComponent = () => {
        if (!notification) return null;

        const typeStyles = {
            success: {
                bg: 'var(--success)',
                icon: '✓',
                borderLeft: '4px solid var(--success)'
            },
            error: {
                bg: 'var(--danger)',
                icon: '✕',
                borderLeft: '4px solid var(--danger)'
            },
            warning: {
                bg: 'var(--warning)',
                icon: '⚠',
                borderLeft: '4px solid var(--warning)'
            },
            info: {
                bg: 'var(--info)',
                icon: 'ℹ',
                borderLeft: '4px solid var(--info)'
            }
        };

        const style = typeStyles[notification.type] || typeStyles.info;

        return (
            <div
                className="notification-banner"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    zIndex: 9999,
                    borderLeft: style.borderLeft,
                    animation: 'slideIn 0.3s ease-out',
                    minWidth: '300px',
                    maxWidth: '500px'
                }}
            >
                <span
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: style.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}
                >
                    {style.icon}
                </span>
                <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>
                    {notification.message}
                </span>
                <button
                    onClick={dismissNotification}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '18px',
                        lineHeight: 1,
                        flexShrink: 0
                    }}
                    title="Cerrar"
                >
                    ×
                </button>
            </div>
        );
    };

    return { notification, showNotification, NotificationComponent };
};
