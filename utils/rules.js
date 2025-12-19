import { storage, KEYS } from './storage.js';

/**
 * @fileoverview Módulo de Regras de Negócio.
 * Centraliza a lógica de decisão sobre bloqueios e limites.
 * Segue o princípio de Single Responsibility (S do SOLID).
 */

/**
 * @typedef {Object} BlockingStatus
 * @property {boolean} shouldBlock - Se o site deve ser bloqueado imediatamente.
 * @property {number} limit - O limite total definido para o site (em segundos).
 * @property {number} used - O tempo total já utilizado hoje (em segundos).
 */

/**
 * Verifica se um domínio específico atingiu seu limite diário.
 * 
 * @param {string} domain - O domínio a ser verificado.
 * @returns {Promise<BlockingStatus>} O estado atual de bloqueio do domínio.
 */
export async function checkBlockingStatus(domain) {
    // Busca dados em paralelo para evitar waterfalls desnecessários
    // (neste caso storage.get já busca múltiplos, mas mantemos o padrão mental)
    const data = await storage.get([KEYS.TIME_BY_SITE, KEYS.LIMITS]);

    // Defensive programming: Defaults seguros
    const used = Number(data[KEYS.TIME_BY_SITE]?.[domain]) || 0;
    const limit = Number(data[KEYS.LIMITS]?.[domain]);

    // Regra de Negócio: Se não existe limite definido, o acesso é livre.
    if (!limit) {
        return { shouldBlock: false, limit: 0, used };
    }

    return {
        shouldBlock: used >= limit,
        limit,
        used
    };
}

/**
 * Reseta as estatísticas de uso diário.
 * Deve ser chamado programaticamente pelo Alarme diário.
 * 
 * @returns {Promise<void>}
 */
export async function resetDailyStats() {
    try {
        await storage.set({
            [KEYS.TIME_BY_SITE]: {},
            [KEYS.LAST_RESET]: new Date().toDateString()
        });
        console.info('[Focusly] Reset diário concluído com sucesso.');
    } catch (error) {
        console.error('[Focusly] Falha ao resetar estatísticas:', error);
        // Opcional: Lançar erro para retry mechanism se houver
    }
}
