export class TrieNode {
  constructor() {
    this.children = {};
    this.word = null;
  }
}

export class Trie {
  constructor(words) {
    this.root = new TrieNode();
    words.forEach(word => this.insert(word));
  }

  insert(word) {
    let node = this.root;
    for (let c of word) {
      if (!node.children[c]) node.children[c] = new TrieNode();
      node = node.children[c];
    }
    node.word = word;
  }
}