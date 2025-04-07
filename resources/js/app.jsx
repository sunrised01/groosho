    import '../css/app.css';
    import './bootstrap';
    import store from './redux/store'; 
    import { Provider } from 'react-redux';

    import { createInertiaApp } from '@inertiajs/react';
    import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
    import { createRoot } from 'react-dom/client';
    import { Inertia } from '@inertiajs/inertia'; 

    const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

    // Global before hook to intercept delete actions
    Inertia.on('before', (event) => {
        const methodsToConfirm = ['delete']; 
        if (methodsToConfirm.includes(event.detail.visit.method)) {
            if (event.detail.visit.method === 'delete' && window.confirm('Are you sure you want to move this item to trash?')) {
                return true;
            }
            event.preventDefault();
            return false;
        }
    });

    createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob('./Pages/**/*.jsx'),
            ),
        setup({ el, App, props }) {
            const root = createRoot(el);

            root.render(
                <Provider store={store}>
                    <App {...props} />
                </Provider>
            );
        },
        progress: {
            color: '#4B5563',
        },
    });
