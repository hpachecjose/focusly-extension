import { getDomain, getNextMidnight } from '../utils/time.js';
import { storage, KEYS } from '../utils/storage.js';
import { checkBlockingStatus, resetDailyStats } from '../utils/rules.js';

let currentTab = null;

// ==========================================
// Gerenciamento de Sessão e Tempo
// ==========================================

/**
 * Fecha a sessão atual: calcula tempo gasto e salva
 */
async function closeCurrentSession() {
  if (!currentTab) return;

  const now = Date.now();
  const elapsedSeconds = Math.floor((now - currentTab.startTime) / 1000);

  // Zera referência imediata para evitar duplicações se função for chamada rápido d+
  const tabToClose = currentTab;
  currentTab = null;

  if (elapsedSeconds <= 0) return;

  const domain = tabToClose.domain;

  // Busca dados atuais
  const data = await storage.get([KEYS.TIME_BY_SITE]);
  const timeBySite = data[KEYS.TIME_BY_SITE] || {};

  // Atualiza tempo
  timeBySite[domain] = (timeBySite[domain] || 0) + elapsedSeconds;

  // Salva
  await storage.set({ [KEYS.TIME_BY_SITE]: timeBySite });

  console.log(`[Focusly] +${elapsedSeconds}s em ${domain}. Total: ${timeBySite[domain]}s`);
}

/**
 * Inicia nova sessão de monitoramento
 */
function openNewSession(tab) {
  if (!tab.url) return;

  const domain = getDomain(tab.url);
  if (!domain) return; // Não monitoramos about:blank, chrome://, etc.

  currentTab = {
    tabId: tab.id,
    domain: domain,
    startTime: Date.now()
  };

  checkAndEnforceRules(domain, tab.id);
}

/**
 * Verifica limites e notifica/bloqueia se necessário
 */
async function checkAndEnforceRules(domain, tabId) {
  const { shouldBlock, used, limit } = await checkBlockingStatus(domain);

  // Se deve bloquear, manda mensagem pro content script
  if (shouldBlock) {
    chrome.tabs.sendMessage(tabId, { type: "BLOCK_PAGE" }).catch(() => {
      // Ignora erro se content script ainda não carregou
    });

    // Atualiza ícone ou badge para indicar bloqueio
    chrome.action.setBadgeText({ text: "⛔", tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId });
  } else if (limit > 0 && used > (limit * 0.8)) {
    // Alerta aos 80% do limite
    // Opcional: Notificação
  } else {
    chrome.action.setBadgeText({ text: "", tabId: tabId });
  }
}


// ==========================================
// Event Listeners (Chrome APIs)
// ==========================================

// 1. Troca de Aba
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await closeCurrentSession();

  try {
    const tab = await chrome.tabs.get(tabId);
    openNewSession(tab);
  } catch (err) {
    console.error("Erro ao pegar aba:", err);
  }
});

// 2. Navegação na mesma aba (mudança de URL)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // Se a página carregou e é a ativa, revalida regras (pode precisar reinjetar bloqueio)
    if (currentTab && currentTab.domain === getDomain(tab.url)) {
      checkAndEnforceRules(currentTab.domain, tabId);
    }
  }

  if (changeInfo.url) {
    // Se mudou URL da aba ativa
    if (currentTab && currentTab.tabId === tabId) {
      await closeCurrentSession();
      openNewSession(tab);
    }
  }
});

// 3. Detecção de Inatividade (Idle)
// 60 segundos de inatividade = pausa contagem
chrome.idle.setDetectionInterval(60);

chrome.idle.onStateChanged.addListener(async (state) => {
  console.log(`[Focusly] Estado alterado para: ${state}`);

  if (state === 'idle' || state === 'locked') {
    await closeCurrentSession();
  } else if (state === 'active') {
    // Usuário voltou. Descobre onde ele está.
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      openNewSession(tab);
    }
  }
});

// 4. Mensagens do Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Aqui podemos receber heartbeats ou outros eventos específicos
  if (message.type === "CHECK_LIMITS") {
    if (sender.tab) {
      const domain = getDomain(sender.tab.url);
      checkAndEnforceRules(domain, sender.tab.id);
    }
  }
});

// 5. Instalação e Inicialização
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Focusly] Instalado/Atualizado.');

  // Configura alarme de reset diário
  chrome.alarms.create('dailyReset', {
    when: getNextMidnight(),
    periodInMinutes: 1440 // 24h
  });
});

// 6. Alarmes
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await resetDailyStats();
    // Recalcular próximo alarme para garantir precisão
  }
});
