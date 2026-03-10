class ICCProfile {
  // store profiles as data and create spaces later?
  constructor(label, data, channels, alternate) {
    this.label = label;
    this.data = data;
    this.channels = channels;
    this.alternate = alternate;
    this.ref = null;
    this.streamRef = null;
  }

  embed(document) {
    if (this.ref) {
      return;
    }
    this.document = document;

    this.streamRef = this.document.ref({
      Alternate: this.alternate,
      N: this.channels,
      Length: this.data.length,
    });
    this.streamRef.write(this.data);
    this.streamRef.end();

    this.ref = this.document.ref([`ICCBased ${this.streamRef}`]);
    this.ref.end();

    this.data = null;
  }
}

export default ICCProfile;
