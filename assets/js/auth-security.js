const STORAGE_PREFIX = "apollo-security:";

const DEFAULT_OPTIONS = {
  baseCooldownMs: 15000,
  backoffFactor: 2,
  maxCooldownMs: 60 * 60 * 1000,
  resetMs: 10 * 60 * 1000,
  lockoutThreshold: Infinity,
  lockoutMs: 0
};

function now() {
  return Date.now();
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function readState(key) {
  if (typeof localStorage === "undefined") {
    return { failCount: 0, blockedUntil: 0, lastFailAt: 0 };
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { failCount: 0, blockedUntil: 0, lastFailAt: 0 };
    const data = JSON.parse(raw);
    return {
      failCount: safeNumber(data.failCount),
      blockedUntil: safeNumber(data.blockedUntil),
      lastFailAt: safeNumber(data.lastFailAt)
    };
  } catch (error) {
    console.warn("auth-security: fallo al leer el estado", error);
    return { failCount: 0, blockedUntil: 0, lastFailAt: 0 };
  }
}

function writeState(key, state) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn("auth-security: no se pudo guardar el estado", error);
  }
}

export class AttemptGuard {
  constructor(key, options = {}) {
    this.storageKey = `${STORAGE_PREFIX}${key}`;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.state = readState(this.storageKey);
  }

  canAttempt() {
    this.#autoReset();
    const blockedUntil = safeNumber(this.state.blockedUntil);
    const remaining = blockedUntil - now();
    if (remaining > 0) {
      return { allowed: false, waitMs: remaining };
    }
    return { allowed: true, waitMs: 0 };
  }

  recordSuccess() {
    this.state = { failCount: 0, blockedUntil: 0, lastFailAt: 0 };
    writeState(this.storageKey, this.state);
  }

  recordFailure() {
    const current = now();
    const nextState = { ...this.state };
    nextState.failCount = safeNumber(nextState.failCount) + 1;
    nextState.lastFailAt = current;

    const { baseCooldownMs, backoffFactor, maxCooldownMs, lockoutThreshold, lockoutMs } = this.options;
    let delay = baseCooldownMs * Math.pow(backoffFactor, Math.max(0, nextState.failCount - 1));

    if (Number.isFinite(lockoutThreshold) && nextState.failCount >= lockoutThreshold) {
      delay = Math.max(delay, lockoutMs);
    }

    delay = Math.min(delay, maxCooldownMs);
    nextState.blockedUntil = current + delay;

    this.state = nextState;
    writeState(this.storageKey, nextState);
    return delay;
  }

  #autoReset() {
    const { resetMs } = this.options;
    if (!resetMs) return;
    const lastFailAt = safeNumber(this.state.lastFailAt);
    if (!lastFailAt) return;
    if (now() - lastFailAt > resetMs) {
      this.recordSuccess();
    }
  }
}

function getCrypto() {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (!cryptoObj || (!cryptoObj.getRandomValues && !cryptoObj.randomUUID)) {
    console.warn("auth-security: API crypto limitada, usando generador menos seguro");
  }
  return cryptoObj;
}

function randomInt(min, max) {
  const range = max - min + 1;
  const cryptoObj = getCrypto();
  if (cryptoObj?.getRandomValues) {
    const buffer = new Uint32Array(1);
    cryptoObj.getRandomValues(buffer);
    return min + (buffer[0] % range);
  }
  return min + Math.floor(Math.random() * range);
}

function randomUUID() {
  const cryptoObj = getCrypto();
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

async function sha256(message) {
  const cryptoObj = getCrypto();
  if (!cryptoObj?.subtle?.digest) {
    throw new Error("Crypto API no disponible para SHA-256");
  }
  const encoded = new TextEncoder().encode(message);
  const hashBuffer = await cryptoObj.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const OPERATIONS = [
  {
    symbol: "+",
    compute: (a, b) => a + b
  },
  {
    symbol: "×",
    compute: (a, b) => a * b
  }
];

export class SecurityChallenge {
  constructor(expirationMs = 5 * 60 * 1000) {
    this.expirationMs = expirationMs;
    this.state = null;
  }

  async generate() {
    const op = OPERATIONS[randomInt(0, OPERATIONS.length - 1)];
    const left = randomInt(10, 99);
    const right = op.symbol === "×" ? randomInt(2, 9) : randomInt(10, 99);
    const result = op.compute(left, right);
    const token = randomUUID();
    const hash = await sha256(`${result}:${token}`);

    this.state = {
      hash,
      token,
      expiresAt: now() + this.expirationMs
    };

    return `Resuelve la operación: ${left} ${op.symbol} ${right}`;
  }

  async verify(answer) {
    if (!this.state) return false;
    if (now() > this.state.expiresAt) {
      this.state = null;
      return false;
    }
    const normalized = String(answer ?? "").trim();
    if (!/^[-]?\d+$/.test(normalized)) {
      return false;
    }
    const attemptHash = await sha256(`${normalized}:${this.state.token}`);
    const valid = attemptHash === this.state.hash;
    if (valid) {
      this.state = null;
    }
    return valid;
  }
}

export function formatDuration(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (minutes > 0) {
    parts.push(`${minutes} min${minutes === 1 ? "" : "s"}`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} s`);
  }
  return parts.join(" ");
}
