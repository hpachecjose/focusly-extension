import { storage, KEYS } from './storage.js';

/**
 * Verifica se um domínio deve ser bloqueado
 * @param {string} domain 
 * @returns {Promise<{shouldBlock: boolean, limit: number, used: number}>}
 */
export async function checkBlockingStatus(domain) {
    const data = await storage.get([KEYS.TIME_BY_SITE, KEYS.LIMITS]);

    const used = data[KEYS.TIME_BY_SITE]?.[domain] || 0;
    const limit = data[KEYS.LIMITS]?.[domain]; // Limite em segundos

    // Se não tem limite definido, não bloqueia
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
 * Reseta as estatísticas diárias
 */
export async function resetDailyStats() {
    await storage.set({
        [KEYS.TIME_BY_SITE]: {},
        [KEYS.LAST_RESET]: new Date().toDateString()
    });
    console.log('[Focusly] Estatísticas diárias resetadas.');
}
