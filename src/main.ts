import { createApp } from 'vue';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import './styles/global.css';

registerSW({ immediate: true, onNeedRefresh: () => { window.location.reload(); } });
createApp(App).mount('#app');
