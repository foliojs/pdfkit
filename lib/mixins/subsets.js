import PDFA1 from './pdfa1';
// import PDFA2 from './pdfa2';

export default {
    _importSubset(subset) {
        Object.assign(this, subset)
    },

    initSubset(options) {
        switch (options.subset) {
            case 'PDF/A-1':
            case 'PDF/A-1a':
            case 'PDF/A-1b':
                this._importSubset(PDFA1);
                this.initPDFA1(options);
                break;
            // case 'PDF/A-2':
            // case 'PDF/A-2a':
            // case 'PDF/A-2b':
            // case 'PDF/A-2u':
            //     this._importSubset(PDFA2);
            //     this.initPDFA2(options);
            //     break;
        }
    }
}

