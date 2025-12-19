import { storage, KEYS } from '../utils/storage.js';
import { getDomain, formatTime } from '../utils/time.js';

const form = document.getElementById('add-form');
const list = document.getElementById('rules-list');

/**
 * Carrega e renderiza a lista de regras
 */
async function loadRules() {
    const data = await storage.get([KEYS.LIMITS]);
    const limits = data[KEYS.LIMITS] || {};

    list.innerHTML = '';

    const domains = Object.keys(limits);

    if (domains.length === 0) {
        list.innerHTML = '<p class="empty">Nenhuma regra definida. Adicione um site acima.</p>';
        return;
    }

    domains.forEach(domain => {
        const limitSeconds = limits[domain];
        const limitMinutes = Math.floor(limitSeconds / 60);

        const div = document.createElement('div');
        div.className = 'rule-item';

        // Create elements securely using textContent
        const infoDiv = document.createElement('div');
        infoDiv.className = 'rule-info';

        const strong = document.createElement('strong');
        strong.textContent = domain; // Safe XSS fix

        const span = document.createElement('span');
        span.textContent = `Limite: ${limitMinutes} min (${formatTime(limitSeconds)})`;

        infoDiv.appendChild(strong);
        infoDiv.appendChild(span);

        const btn = document.createElement('button');
        btn.className = 'btn-delete';
        btn.textContent = 'Remover';
        btn.dataset.domain = domain;

        div.appendChild(infoDiv);
        div.appendChild(btn);
        list.appendChild(div);
    });

    // Attach delete events
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const domain = e.target.dataset.domain;
            await removeRule(domain);
        });
    });
}

/**
 * Salva uma nova regra
 */
async function addRule(domain, minutes) {
    const cleanDomain = getDomain(`https://${domain}`);

    if (!cleanDomain) {
        alert('Por favor, insira um domínio válido.');
        return;
    }

    const seconds = minutes * 60;

    const data = await storage.get([KEYS.LIMITS]);
    const limits = data[KEYS.LIMITS] || {};

    limits[cleanDomain] = seconds;

    await storage.set({ [KEYS.LIMITS]: limits });

    // Limpa campos
    document.getElementById('site-url').value = '';
    document.getElementById('site-limit').value = '';

    await loadRules();
}

/**
 * Remove uma regra
 */
async function removeRule(domain) {
    if (!confirm(`Deseja parar de limitar ${domain}?`)) return;

    const data = await storage.get([KEYS.LIMITS]);
    const limits = data[KEYS.LIMITS] || {};

    delete limits[domain]; // Remove a chave

    await storage.set({ [KEYS.LIMITS]: limits });
    await loadRules();
}

// Inicialização
document.addEventListener('DOMContentLoaded', loadRules);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('site-url').value.trim();
    const limit = parseInt(document.getElementById('site-limit').value);

    if (url && limit > 0) {
        await addRule(url, limit);
    }
});
