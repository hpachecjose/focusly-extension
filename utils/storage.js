/**
 * Wrapper simplificado para chrome.storage.local
 */
export const storage = {
    /**
     * Recupera dados do storage
     * @param {string|string[]} keys 
     * @returns {Promise<Object>}
     */
    get: (keys) => {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, (result) => {
                resolve(result || {});
            });
        });
    },

    /**
     * Salva dados no storage
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    set: (data) => {
        return new Promise((resolve) => {
            chrome.storage.local.set(data, () => {
                resolve();
            });
        });
    },

    /**
     * Remove chaves do storage
     * @param {string|string[]} keys 
     * @returns {Promise<void>}
     */
    remove: (keys) => {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, () => {
                resolve();
            });
        });
    }
};

/**
 * Chaves padrão usadas no app
 */
export const KEYS = {
    TIME_BY_SITE: 'timeBySite',
    LIMITS: 'limits',
    BLOCKED_SITES: 'blockedSites', // Lista de sites monitorados
    LAST_RESET: 'lastReset' // Data do último reset
};
