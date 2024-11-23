export class CryptoService {
  private static instance: CryptoService;
  private keyPair: CryptoKeyPair | null = null;

  private constructor() {}

  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  public async generateKeyPair(): Promise<void> {
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  public async getPublicKey(): Promise<JsonWebKey> {
    if (!this.keyPair) {
      await this.generateKeyPair();
    }
    return window.crypto.subtle.exportKey("jwk", this.keyPair!.publicKey);
  }

  public async encrypt(data: string, publicKey: JsonWebKey): Promise<string> {
    const importedPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    const encodedData = new TextEncoder().encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      importedPublicKey,
      encodedData
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
  }

  public async decrypt(encryptedData: string): Promise<string> {
    if (!this.keyPair) {
      throw new Error("Key pair not generated");
    }

    const decodedData = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.keyPair.privateKey,
      decodedData
    );

    return new TextDecoder().decode(decryptedData);
  }

  public async generateSymmetricKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  public async encryptSymmetric(data: string, key: CryptoKey): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedData
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...result));
  }

  public async decryptSymmetric(encryptedData: string, key: CryptoKey): Promise<string> {
    const decodedData = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = decodedData.slice(0, 12);
    const data = decodedData.slice(12);

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  }

  public async encryptMessage(message: string, publicKey: JsonWebKey): Promise<string> {
    const importedPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    const encodedMessage = new TextEncoder().encode(message);
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      importedPublicKey,
      encodedMessage
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedMessage)));
  }

  public async decryptMessage(encryptedMessage: string): Promise<string> {
    if (!this.keyPair) {
      throw new Error("密钥对未生成");
    }

    const decodedMessage = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const decryptedMessage = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.keyPair.privateKey,
      decodedMessage
    );

    return new TextDecoder().decode(decryptedMessage);
  }
}

