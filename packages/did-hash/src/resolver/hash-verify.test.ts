import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import {
  CryptoService,
  defaultCryptoKeyService,
  getRandomValues,
} from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import {
  DidHashRegister,
  DidHashResolver,
  SignatureIssuerService,
} from '@trustcerts/did-hash';
import { base58Encode, write } from '@trustcerts/helpers';
import { WalletService } from '@trustcerts/wallet';
import { randomBytes } from 'crypto';
import { existsSync, readFileSync, rmSync } from 'fs';

describe('test signature verify service', () => {
  let config: ConfigService;

  let cryptoService: CryptoService;

  const testFile = 'tmp/test';

  const testValues = JSON.parse(readFileSync('./tests/values.json', 'utf-8'));

  beforeAll(async () => {
    console.log(testValues);
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);
    const wallet = new WalletService(config);
    await wallet.init();

    cryptoService = new CryptoService();

    const key = (
      await wallet.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    await cryptoService.init(key);
  }, 10000);

  it('verify file', async () => {
    if (!config.config.invite) throw new Error();
    const issuer = new SignatureIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const didhashRegister = new DidHashRegister();
    const resolver = new DidHashResolver();

    write(testFile, getRandomValues(new Uint8Array(200)).toString());
    const did = await didhashRegister.signFile(testFile, [
      config.config.invite.id,
    ]);
    await didhashRegister.save(did, issuer);
    const loadedDidByTransactions = await resolver.verifyFile(testFile, {
      doc: false,
    });
    expect(loadedDidByTransactions.getDocument()).toEqual(did.getDocument());
    const loadedDidByDoc = await resolver.verifyFile(testFile, { doc: true });
    expect(loadedDidByDoc.getDocument()).toEqual(did.getDocument());
  }, 10000);

  it('verify buffer', async () => {
    if (!config.config.invite) throw new Error();
    const issuer = new SignatureIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const didhashRegister = new DidHashRegister();
    const resolver = new DidHashResolver();

    const buffer = randomBytes(16).buffer;
    const did = await didhashRegister.signBuffer(buffer, [
      config.config.invite.id,
    ]);
    await didhashRegister.save(did, issuer);
    const loadedDidByTransactions = await resolver.verifyBuffer(buffer, {
      doc: false,
    });
    expect(loadedDidByTransactions.getDocument()).toEqual(did.getDocument());
    const loadedDidByDoc = await resolver.verifyBuffer(buffer, { doc: true });
    expect(loadedDidByDoc.getDocument()).toEqual(did.getDocument());
  }, 10000);

  it('verify string', async () => {
    if (!config.config.invite) throw new Error();
    const issuer = new SignatureIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const signature = base58Encode(getRandomValues(new Uint8Array(20)));

    const didhashRegister = new DidHashRegister();
    const resolver = new DidHashResolver();

    const did = await didhashRegister.signString(signature, [
      config.config.invite.id,
    ]);
    await didhashRegister.save(did, issuer);
    const loadedDidByTransactions = await resolver.verifyString(signature, {
      doc: false,
    });
    expect(loadedDidByTransactions.getDocument()).toEqual(did.getDocument());
    const loadedDidByDoc = await resolver.verifyString(signature, {
      doc: true,
    });
    expect(loadedDidByDoc.getDocument()).toEqual(did.getDocument());
  });

  it('revoke string', async () => {
    if (!config.config.invite) throw new Error();
    const issuer = new SignatureIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const signature = base58Encode(getRandomValues(new Uint8Array(20)));

    const didhashRegister = new DidHashRegister();
    const resolver = new DidHashResolver();

    const did = await didhashRegister.signString(signature, [
      config.config.invite.id,
    ]);
    await didhashRegister.save(did, issuer);
    let loadedDid = await resolver.load(did.id);

    expect(loadedDid.revoked).toBeUndefined();
    loadedDid.revoked = new Date().toISOString();
    await didhashRegister.save(loadedDid, issuer);
    loadedDid = await resolver.load(did.id);
    expect(loadedDid.revoked).toBeDefined();
    // expect(loadedDid.revoked! > loadedDid.).toBeTruthy();
  }, 10000);

  afterAll(() => {
    if (existsSync(testFile)) {
      rmSync(testFile);
    }
  });
});
