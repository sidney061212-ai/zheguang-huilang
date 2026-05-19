export class ShareAdapter {
  enabled = false;

  share(): void {
    // V1 must not include incentivized sharing. This is only a compliant extension point.
    if (!this.enabled) return;
  }
}
