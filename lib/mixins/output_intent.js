export default {
  initOutputIntent() {
    this._root.data.OutputIntents = this._root.data.OutputIntents || [];
  },

  outputIntent(
    type,
    s,
    info,
    outputConditionIdentifier,
    destOutputProfileLabel,
  ) {
    const profile = this._colorProfiles[destOutputProfileLabel];
    if (profile) {
      throw Error(
        'Invalid color profile label, the profile should be set first',
      );
    }

    const intentRef = this.ref({
      Type: type,
      S: s,
      Info: info,
      OutputConditionIdentifier: outputConditionIdentifier,
      DestOutputProfile: profile.ref,
    });
    intentRef.end();

    this._root.data.OutputIntents.push(intentRef);
    return this;
  },
};
