import sRGB_IEC61966_ICC_PROFILE from '../color_profiles/sRGB_IEC61966_ICC'

export default {

    initPDFA1(pOptions) {
        switch(pOptions.subset) {
            case 'PDF/A-1':
            case 'PDF/A-1b':
                this.subset = 1;
                this.subset_conformance = 'B';
                break;
            case 'PDF/A-1a':
                this.subset = 1;
                this.subset_conformance = 'A';
                break;
        }
    },

    endSubset() {
        this._addPdfaMetadata();
        this._addColorOutputIntent();
    },

    _addColorOutputIntent() {
        const colorProfileRef = this.ref({
            Length: sRGB_IEC61966_ICC_PROFILE.length,
            N: 3
        });
        colorProfileRef.write(sRGB_IEC61966_ICC_PROFILE);
        colorProfileRef.end();

        const intentRef = this.ref({
            Type: 'OutputIntent',
            S: 'GTS_PDFA1',
            Info: new String('sRGB IEC61966-2.1'),
            OutputConditionIdentifier: new String('sRGB IEC61966-2.1'),
            DestOutputProfile: colorProfileRef,
        });
        intentRef.end();

        this._root.data.OutputIntents = [intentRef];
    },

    _getPdfaid() {
        return `
        <rdf:Description xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/" rdf:about="">
            <pdfaid:part>${this.subset}</pdfaid:part>
            <pdfaid:conformance>${this.subset_conformance}</pdfaid:conformance>
        </rdf:Description>
        `;
    },

    _addPdfaMetadata() {
        this.appendXML(this._getPdfaid());
    },
    
}