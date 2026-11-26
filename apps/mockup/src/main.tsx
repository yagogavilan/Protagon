import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import { goTo } from './lib/nav';
import { useDemo } from './state/store';

// Atalhos de URL: ?go=C07 abre uma tela do inventário; ?network=1 carrega a rede de exemplo
const params = new URLSearchParams(window.location.search);
if (params.get('network') === '1') useDemo.getState().seedNetwork();
const go = params.get('go');
if (go) goTo(go);

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
