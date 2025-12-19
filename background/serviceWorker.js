```
import { getDomain, getNextMidnight } from '../utils/time.js';
import { storage, KEYS } from '../utils/storage.js';
import { checkBlockingStatus, resetDailyStats } from '../utils/rules.js';

/**
 * @fileoverview Service Worker principal do Focusly.
 * Responsável pelo gerenciamento de estado global, contagem de tempo,
 * detecção de inatividade e aplicação de regras de bloqueio.
 * 
 * ARQUITETURA:
 * - O Service Worker atua como a "Single Source of Truth" para o estado da sessão.
 * - Utiliza padrão de eventos (Event-Driven) para responder a mudanças de aba e URL.
 * - Persistência é garantida via chrome.storage.local para tolerância a falhas.
 */

/**
 * Estado em memória da sessão atual.
 * @type {{tabId: number, domain: string, startTime: number} | null}
 */
let currentTab = null;

// ============================================================================
// LÓGICA DE NEGÓCIO (CORE)
// ============================================================================

/**
 * Encerra a sessão de monitoramento atual e persiste os dados.
 * 
 * MOTIVAÇÃO:
 * É crucial calcular e salvar o tempo assim que o foco muda (ou o usuário fica inativo)
 * para evitar perda de dados em caso de fechamento abrupto do navegador.
 * 
 * @returns {Promise<void>}
 */
async function closeCurrentSession() {
  if (!currentTab) return;

  const now = Date.now();
  // Arredondamos para baixo para evitar frações de segundo irrelevantes
  const elapsedSeconds = Math.floor((now - currentTab.startTime) / 1000);

  // Captura referência local e zera global imediatamente para evitar condições de corrida
  const sessionToClose = currentTab;
  currentTab = null;

  // Ignora sessões inválidas ou muito curtas (ruído)
  if (elapsedSeconds <= 0) return;

  const domain = sessionToClose.domain;

  try {
    const data = await storage.get([KEYS.TIME_BY_SITE]);
    const timeBySite = data[KEYS.TIME_BY_SITE] || {};

    // Atualização atômica (na medida do possível sem transactions reais no chrome.storage)
    timeBySite[domain] = (timeBySite[domain] || 0) + elapsedSeconds;
    
    await storage.set({ [KEYS.TIME_BY_SITE]: timeBySite });
    
    // Log estruturado para debug (removido em prod se necessário)
    console.debug(`[Focusly] Sessão encerrada: +${ elapsedSeconds }s para ${ domain }.Total: ${ timeBySite[domain] } s`);
  } catch (error) {
    console.error(`[Focusly] Falha crítica ao salvar sessão para ${ domain }: `, error);
  }
}

/**
 * Inicia uma nova sessão de monitoramento para a aba ativa.
 * 
 * @param {chrome.tabs.Tab} tab - A aba que acabou de ganhar foco/foi carregada.
 */
function openNewSession(tab) {
  if (!tab.url) return;
  
  const domain = getDomain(tab.url);
  
  // Early return se for um domínio de sistema ou inválido
  if (!domain) return; 

  currentTab = {
    tabId: tab.id,
    domain: domain,
    startTime: Date.now()
  };

  // Verifica imediatamente se o site já deveria estar bloqueado
  checkAndEnforceRules(domain, tab.id);
}

/**
 * Verifica as regras de limite para o domínio e aplica ações (bloqueio/alerta).
 * 
 * @param {string} domain - O domínio a ser verificado.
 * @param {number} tabId - O ID da aba onde a ação será aplicada.
 */
async function checkAndEnforceRules(domain, tabId) {
  try {
    const { shouldBlock, used, limit } = await checkBlockingStatus(domain);

    if (shouldBlock) {
      // Envia comando imperativo para o Content Script
      chrome.tabs.sendMessage(tabId, { type: "BLOCK_PAGE" }).catch(() => {
        // Silencia erro esperado: Content script pode não estar injetado ainda (ex: carregando)
      });
      
      // Feedback visual na UI do navegador
      chrome.action.setBadgeText({ text: "⛔", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#EF4444", tabId: tabId }); // Vermelho alerta
    } else {
      // Limpa estado visual se não houver bloqueio
      chrome.action.setBadgeText({ text: "", tabId: tabId });
      
      // Lógica futura: Alerta de proximidade (ex: 80% do limite) pode ser injetado aqui
    }
  } catch (error) {
    console.error(`[Focusly] Erro ao verificar regras para ${ domain }: `, error);
  }
}


// ============================================================================
// EVENT LISTENERS (INFRAESTRUTURA)
// ============================================================================

/**
 * Listener: Mudança de Aba Ativa
 * Disparado quando o usuário troca de aba na mesma janela.
 */
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await closeCurrentSession();

  try {
    const tab = await chrome.tabs.get(tabId);
    openNewSession(tab);
  } catch (err) {
    // Aba pode ter sido fechada antes de processarmos
    console.warn("[Focusly] Tentativa de acessar aba inexistente:", err);
  }
});

/**
 * Listener: Atualização da Aba (Navegação/Refresh)
 * Disparado quando a URL muda dentro da mesma aba, ou o status de carregamento muda.
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Cenário 1: Página terminou de carregar (status: complete)
  // Re-validamos as regras para garantir que o bloqueio (CSS/DOM) seja reaplicado se necessário.
  if (changeInfo.status === 'complete' && tab.active) {
    const currentDomain = getDomain(tab.url);
    if (currentTab && currentTab.domain === currentDomain) {
        checkAndEnforceRules(currentDomain, tabId);
    }
  }

  // Cenário 2: URL mudou na aba ativa (ex: SPA navigation ou link click)
  if (changeInfo.url) {
    // Se a mudança ocorre na aba que estamos monitorando, precisamos fechar a sessão do site anterior
    if (currentTab && currentTab.tabId === tabId) {
        await closeCurrentSession();
        openNewSession(tab);
    }
  }
});

/**
 * Listener: Detecção de Inatividade (Idle)
 * Regra de Negócio: Se o usuário não interage por 60s, o tempo não deve contar.
 */
const IDLE_THRESHOLD_SECONDS = 60;
chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS); 

chrome.idle.onStateChanged.addListener(async (state) => {
  console.log(`[Focusly] Estado de inatividade alterado: ${ state } `);
  
  if (state === 'idle' || state === 'locked') {
    // Pausa contagem imediatamente
    await closeCurrentSession();
  } else if (state === 'active') {
    // Retomada: Precisamos descobrir qual aba está ativa para reiniciar a contagem
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      openNewSession(tab);
    }
  }
});

/**
 * Listener: Comunicação Inter-processos (Content Script <-> Background)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validação estrita do tipo de mensagem
  if (message.type === "CHECK_LIMITS") {
    if (sender.tab) {
      const domain = getDomain(sender.tab.url);
      if (domain) {
        checkAndEnforceRules(domain, sender.tab.id);
      }
    }
  }
  // Sempre retornar true se for async (não é o caso aqui, mas boa prática manter em mente)
});

/**
 * Listener: Ciclo de Vida da Extensão (Instalação/Update)
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Focusly] Inicialização do sistema...');
  
  // Agendamento do Reset Diário
  // Utiliza chrome.alarms para garantir execução mesmo se o browser reiniciar
  chrome.alarms.create('dailyReset', {
    when: getNextMidnight(),
    periodInMinutes: 1440 // 24 horas fixas
  });
});

/**
 * Listener: Alarmes Agendados
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await resetDailyStats();
    // Nota: O alarme é periódico, então não precisamos recriá-lo manualmente
  }
});
```
