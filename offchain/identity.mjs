import { Identity } from "@semaphore-protocol/identity";

function normalizePublicKey(point) {
  return point.map((coordinate) => coordinate.toString());
}

export class PortIdentity {
  constructor(privateKey) {
    this._identity = new Identity(privateKey);
  }

  static import(serializedPrivateKey) {
    const imported = Identity.import(serializedPrivateKey);
    return new PortIdentity(imported.privateKey);
  }

  get privateKey() {
    return this._identity.privateKey;
  }

  get secretScalar() {
    return this._identity.secretScalar;
  }

  get publicKey() {
    return this._identity.publicKey;
  }

  get commitment() {
    return this._identity.commitment;
  }

  export() {
    return this._identity.export();
  }

  serialize() {
    return {
      privateKey: this.export(),
      secretScalar: this.secretScalar.toString(),
      commitment: this.commitment.toString(),
      publicKey: normalizePublicKey(this.publicKey)
    };
  }

  toProofIdentity() {
    return {
      secretScalar: this.secretScalar.toString(),
      commitment: this.commitment.toString()
    };
  }
}

export function createPortIdentity(privateKey) {
  return new PortIdentity(privateKey);
}

export function importPortIdentity(serializedPrivateKey) {
  return PortIdentity.import(serializedPrivateKey);
}
