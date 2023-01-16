import PDFA from './pdfa';

export default {
    _importSubset(subset) {
        Object.assign(this, subset)
    },

    initSubset(options) {

        switch (options.subset) {
            case 'PDF/A-1':
            case 'PDF/A-1a':
            case 'PDF/A-1b':
            case 'PDF/A-2':
            case 'PDF/A-2a':
            case 'PDF/A-2b':
            case 'PDF/A-3':
            case 'PDF/A-3a':
            case 'PDF/A-3b':
                this._importSubset(PDFA);
                this.initPDFA(options.subset);
                break;
        }
    }
}