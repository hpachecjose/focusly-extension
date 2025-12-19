/**
 * @fileoverview Content Script responsável por injetar UI na página e comunicar eventos.
 * Funciona como o "Sensor" e "Atuador" na arquitetura do Focusly.
 * NÃO deve conter lógica de negócio (ex: cálculo de tempo ou decisão de bloqueio).
 */

// ============================================================================
// CONFIGURAÇÃO E ESTADO
// ============================================================================

/** @type {boolean} Flag para evitar re-injeção desnecessária do bloqueio */
let isBlocked = false;

// ============================================================================
// MANIPULAÇÃO DO DOM (UI/UX)
// ============================================================================

/**
 * Cria e injeta o overlay de bloqueio na página atual.
 * Responsabilidade: Manipulação visual drástica (Bloqueio).
 */
function showBlockOverlay() {
  if (isBlocked) return;
  isBlocked = true;

  // Interrompe consumo de mídia (UX: silêncio imediato)
  pauseMediaPlayback();

  // Criação do elemento visual
  const overlay = createOverlayElement();

  // Injeção no DOM
  document.body.appendChild(overlay);

  // Bloqueio de interação física (scroll)
  document.body.style.overflow = 'hidden';
}

/**
 * Itera sobre elementos de mídia e força pausa.
 */
function pauseMediaPlayback() {
  const videos = document.querySelectorAll('video');
  const audios = document.querySelectorAll('audio');

  videos.forEach(v => v.pause());
  audios.forEach(a => a.pause());
}

/**
 * Fabrica o elemento HTML do overlay com estilos e conteúdo.
 * @returns {HTMLElement} O elemento overlay pronto para inserção.
 */
function createOverlayElement() {
  const overlay = document.createElement('div');
  overlay.className = 'focusly-block-overlay';

  // Utiliza innerHTML com conteúdo estático controlado (sem risco XSS aqui pois não há input externo)
  overlay.innerHTML = `
    <div class="focusly-logo">Focusly</div>
    <div class="focusly-message">Tempo Esgotado!</div>
    <div class="focusly-quote">"A disciplina é a mãe do sucesso."</div>
    <div style="font-size: 14px; opacity: 0.7;">Respire fundo e volte ao foco.</div>
  `;

  return overlay;
}

// ============================================================================
// COMUNICAÇÃO COM BACKGROUND (MENSAGERIA)
// ============================================================================

/**
 * Listener de Mensagens recebidas do Background Service Worker.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Protocolo explícito: TYPE define a ação
  if (message.type === "BLOCK_PAGE") {
    showBlockOverlay();
  }
  // No futuro: outros tipos como "WARN_LIMIT" podem ser tratados aqui
});

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

// Solicita verificação imediata de status ao carregar a página
// Motivo: O background pode não saber instantaneamente que o content script carregou
chrome.runtime.sendMessage({ type: "CHECK_LIMITS" }).catch(() => {
  // Falha silenciosa aceitável na inicialização (ex: extensão recarregando)
});
