// content/tracker.js

// Estado local
let isBlocked = false;

/**
 * Injeta o overlay de bloqueio na página
 */
function showBlockOverlay() {
  if (isBlocked) return;
  isBlocked = true;

  // Para mídia (vídeos do youtube, etc)
  const videos = document.querySelectorAll('video');
  videos.forEach(v => v.pause());

  // Cria overlay
  const overlay = document.createElement('div');
  overlay.className = 'focusly-block-overlay';

  overlay.innerHTML = `
    <div class="focusly-logo">Focusly</div>
    <div class="focusly-message">Tempo Esgotado!</div>
    <div class="focusly-quote">"A disciplina é a mãe do sucesso."</div>
    <div style="font-size: 14px; opacity: 0.7;">Respire fundo e volte ao foco.</div>
  `;

  document.body.appendChild(overlay);

  // Bloqueia scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Escuta mensagens do background
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "BLOCK_PAGE") {
    showBlockOverlay();
  }
});

// Ao carregar, pede checagem imediata
chrome.runtime.sendMessage({ type: "CHECK_LIMITS" });

// Detecção simples de atividade para (futuro) reset de inatividade mais preciso se precisar
// Por enquanto, confiamos no chrome.idle do background que é mais eficiente
