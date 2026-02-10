#!/usr/bin/env node
const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const argv = process.argv.slice(2);
const payloadArg = argv[0];
const secretArg = argv[1];

const payload = payloadArg ? JSON.parse(payloadArg) : { sub: 'test-user', exp: Math.floor(Date.now() / 1000) + 3600 };
const secret = secretArg || process.env.DASHBOARD_SECRET || 'ma_super_clef';

const payloadStr = JSON.stringify(payload);
const payloadB64 = base64url(payloadStr);
const hmac = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');

console.log(`${payloadB64}.${hmac}`);
