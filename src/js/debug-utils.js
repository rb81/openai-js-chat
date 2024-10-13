const debugUtils = {
    isDebugMode: false,

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        this.isDebugMode = urlParams.get('debug') === 'true';
    },

    log(...args) {
        if (this.isDebugMode) {
            console.log(...args);
        }
    }
};

export default debugUtils;