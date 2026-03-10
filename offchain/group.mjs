import { Group } from "@semaphore-protocol/group";

function normalizeMembers(members) {
  return members.map((member) => member.toString());
}

function normalizeProof(proof) {
  return {
    root: proof.root.toString(),
    leaf: proof.leaf.toString(),
    siblings: proof.siblings.map((sibling) => sibling.toString()),
    index: proof.index,
    depth: proof.siblings.length
  };
}

export class PortGroup {
  constructor(members = []) {
    this._group = new Group(members);
  }

  static import(serializedGroup) {
    const group = new PortGroup();
    group._group = Group.import(serializedGroup);
    return group;
  }

  get root() {
    return this._group.root;
  }

  get depth() {
    return this._group.depth;
  }

  get size() {
    return this._group.size;
  }

  get members() {
    return this._group.members;
  }

  indexOf(member) {
    return this._group.indexOf(member);
  }

  addMember(member) {
    this._group.addMember(member);
  }

  addMembers(members) {
    this._group.addMembers(members);
  }

  updateMember(index, member) {
    this._group.updateMember(index, member);
  }

  removeMember(index) {
    this._group.removeMember(index);
  }

  generateMerkleProof(index) {
    return this._group.generateMerkleProof(index);
  }

  export() {
    return this._group.export();
  }

  serialize() {
    return {
      root: this.root.toString(),
      depth: this.depth,
      size: this.size,
      members: normalizeMembers(this.members)
    };
  }

  toProverGroup() {
    return {
      root: this.root.toString(),
      depth: this.depth,
      size: this.size,
      members: normalizeMembers(this.members)
    };
  }

  merkleProof(index) {
    return normalizeProof(this.generateMerkleProof(index));
  }
}

export function createPortGroup(members = []) {
  return new PortGroup(members);
}

export function importPortGroup(serializedGroup) {
  return PortGroup.import(serializedGroup);
}
