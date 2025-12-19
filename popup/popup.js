import { getDomain, formatTime } from '../utils/time.js';
import { storage, KEYS } from '../utils/storage.js';

// Elementos DOM
const elDomain = document.getElementById('current-domain');
const elTime = document.getElementById('time-display');
const elProgressBar = document.getElementById('progress-bar');
const elLimitInfo = document.getElementById('limit-info');
const elStatsList = document.getElementById('stats-list');
const btnOptions = document.getElementById('btn-options');

/**
 * Atualiza a interface principal com dados do site atual
 */
async function updateUI() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
        elDomain.textContent = "Nenhum site";
        return;
    }

    const domain = getDomain(tab.url);

    if (!domain) {
        elDomain.textContent = "Página local/sistema";
        elTime.textContent = "--:--";
        elProgressBar.style.width = '0%';
        elLimitInfo.textContent = "";
        return;
    }

    elDomain.textContent = domain;

    // Busca dados
    const data = await storage.get([KEYS.TIME_BY_SITE, KEYS.LIMITS]);
    const timeBySite = data[KEYS.TIME_BY_SITE] || {};
    const limits = data[KEYS.LIMITS] || {};

    const seconds = timeBySite[domain] || 0;
    const limit = limits[domain]; // em segundos

    // Atualiza tempo
    elTime.textContent = formatTime(seconds);

    // Atualiza barra de progresso e texto
    if (limit > 0) {
        const percentage = Math.min((seconds / limit) * 100, 100);
        elProgressBar.style.width = `${percentage}%`;

        // Cores da barra
        elProgressBar.className = 'progress-bar';
        if (percentage > 90) elProgressBar.classList.add('danger');
        else if (percentage > 75) elProgressBar.classList.add('warning');

        elLimitInfo.textContent = `Limite: ${formatTime(limit)}`;
    } else {
        elProgressBar.style.width = '0%';
        elLimitInfo.textContent = "Sem limite definido";
    }

    // Atualiza lista de status
    renderStatsList(timeBySite);
}

/**
 * Renderiza a lista de sites mais acessados hoje
 */
function renderStatsList(timeBySite) {
    const entries = Object.entries(timeBySite)
        .sort(([, a], [, b]) => b - a) // Ordena por tempo (maior pro menor)
        .slice(0, 5); // Top 5

    elStatsList.innerHTML = '';

    if (entries.length === 0) {
        elStatsList.innerHTML = '<div class="empty-state">Nenhum dado ainda hoje.</div>';
        return;
    }

    entries.forEach(([site, seconds]) => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `
      <span class="stat-site">${site}</span>
      <span class="stat-time">${formatTime(seconds)}</span>
    `;
        elStatsList.appendChild(div);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Atualiza a cada segundo enquanto popup estiver aberto
    setInterval(updateUI, 1000);

    btnOptions.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options/options.html'));
        }
    });
});
