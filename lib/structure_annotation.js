class PDFAnnotationReference {
  constructor(annotationRef, pageRef = annotationRef.document.page.dictionary) {
    this.annotationRef = annotationRef;
    this.pageRef = pageRef;
  }
}

export default PDFAnnotationReference;
