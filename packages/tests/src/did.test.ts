import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import {
  CryptoKeyService,
  CryptoService,
  defaultCryptoKeyService,
  ECCryptoKeyService,
  RSACryptoKeyService,
} from '@trustcerts/crypto';
import {
  DidId,
  DidIdIssuerService,
  DidIdRegister,
  DidIdResolver,
  DidNetworks,
  DidRoles,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
// need own package beacause of circular dependency
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

describe('test did', () => {
  let config: ConfigService;

  let wallet: WalletService;

  let cryptoService: CryptoService;

  const resolver = new DidIdResolver();

  const testValues = JSON.parse(readFileSync('./tests/values.json', 'utf-8'));

  const cryptoKeyServices: CryptoKeyService[] = [
    new RSACryptoKeyService(),
    new ECCryptoKeyService(),
  ];

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    wallet = new WalletService(config);
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

  it('verify did chain of trust temporary test case', async () => {
    if (!config.config.invite) throw Error();
    const did = DidIdRegister.create({
      controllers: [config.config.invite.id],
    });
    did.addRole(DidRoles.Client);
    const client = new DidIdIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    await DidIdRegister.save(did, client);
    const resolver = new DidIdResolver();
    const did1 = await resolver.load(did.id);
    expect(did.getDocument()).toEqual(did1.getDocument());
  }, 7000);

  it('read did', async () => {
    if (!config.config.invite) throw Error();
    const did = DidIdRegister.create({
      controllers: [config.config.invite.id],
    });
    did.addRole(DidRoles.Client);
    const client = new DidIdIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    expect(client.getId()).toEqual(cryptoService.fingerPrint.split('#')[0]);
    await DidIdRegister.save(did, client);
    const did1 = await resolver.load(did.id, { doc: false });
    expect(did.getDocument()).toEqual(did1.getDocument());
    const did2 = await resolver.load(did.id, { doc: true });
    expect(did.getDocument()).toEqual(did2.getDocument());
  }, 7000);

  it('read non existing did', (done) => {
    const id = 'did:trust:tc:dev:id:QQQQQQQQQQQQQQQQQQQQQQ';
    resolver.load(id).catch((err) => {
      expect(err).toBeDefined();
      done();
    });
    // await expect(did).rejects.toEqual(new Error(`${id} not found`));
  }, 7000);

  it('test did resolver', () => {
    let exampleNetwork = { gateways: ['a'], observers: ['a'] };
    DidNetworks.add('test:foo', exampleNetwork);
    let resolvedNetwork = DidNetworks.resolveNetwork('test:foo');
    expect(resolvedNetwork).toEqual(exampleNetwork);

    exampleNetwork = { gateways: ['a', 'b'], observers: ['a'] };
    DidNetworks.add('test:foo', exampleNetwork);
    resolvedNetwork = DidNetworks.resolveNetwork('test:foo');
    expect(resolvedNetwork).toEqual(exampleNetwork);
  });

  it('test DidCachedService', async () => {
    // TODO: DidCachedService is not used yet by did resolver
    expect(true).toBeTruthy();
  }, 7000);

  it('test createByInvite', async () => {
    // TODO
  }, 7000);

  it('read invalid did', async () => {
    // RegExp: ^did:trust:[:a-z]*[1-9A-HJ-NP-Za-km-z]{22}$

    const invalidDIDs = [
      'invalid',
      'invalid did',
      'no:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaa', // not starting with did:trust
      'did:foo:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaa', // not starting with did:trust
      'Did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaa', // did not lower case
      'did:Trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaa', // trust not lower case
      'did:trust:TC:dev:id:aaaaaaaaaaaaaaaaaaaaaa', // tc not lower case
      'did:trust:TC:dev:iD:aaaaaaaaaaaaaaaaaaaaaa', // id not lower case
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaa', // too short (<22)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaaa', // identifier too long (>22)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaa0', // invalid chars (not base58)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaO', // invalid chars (not base58)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaal', // invalid chars (not base58)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaaI', // invalid chars (not base58)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaa/', // invalid chars (not base58)
      'did:trust:tc:dev:id:aaaaaaaaaaaaaaaaaaaaa+', // invalid chars (not base58)
      'did:trust:tctctctctct:dev:id:aaaaaaaaaaaaaaaaaaaaaa', // namespace part long (>10)
      'did:trust:tc:devdevdevde:id:aaaaaaaaaaaaaaaaaaaaaa', // namespace part long (>10)
      'did:trust:tc:dev:idididididi:aaaaaaaaaaaaaaaaaaaaaa', // namespace part long (>10)
      'did:trust::dev:id:aaaaaaaaaaaaaaaaaaaaaa', // no primary namespace specified
      'did:trust:tc:dev:foo:aaaaaaaaaaaaaaaaaaaaaa', // did type not 'id'
    ];

    for (const did of invalidDIDs) {
      expect(() => new DidId(did)).toThrowError();
    }
  }, 7000);

  it('test DidId addKey, getKey, removeKey', async () => {
    const did = DidIdRegister.create();
    for (const cryptoKeyService of cryptoKeyServices) {
      const key = await cryptoKeyService.generateKeyPair(did.id);

      expect(() => did.getKey(key.identifier)).toThrowError('key not found');

      did.addKey(key.identifier, key.publicKey);
      expect(did.getKey(key.identifier).id).toEqual(key.identifier);
      expect(
        did.getChanges().verificationMethod?.add?.map((val) => val.id)
      ).toContain(key.identifier);
      expect(() => did.addKey(key.identifier, key.publicKey)).toThrowError(
        'key already exists'
      );

      did.removeKey(key.identifier);
      expect(() => did.getKey(key.identifier)).toThrowError('key not found');
      expect(() => did.removeKey(key.identifier)).toThrowError('key not found');
      expect(did.getChanges().verificationMethod?.remove).toContain(
        key.identifier
      );
    }
  }, 7000);

  it('test DidId addService, getService, removeService', async () => {
    const did = DidIdRegister.create();

    const id = 'testService';
    const fullId = `${did.id}#${id}`;
    const endpoint = 'testEndpoint';
    const type = 'testType';

    expect(() => did.getService(id)).toThrowError('service not found');

    did.addService(id, endpoint, type);
    expect(did.getService(id).id).toEqual(fullId);
    expect(did.getChanges().service?.add).toContainEqual({
      id: fullId,
      endpoint,
      type,
    });
    expect(() => did.addService(id, endpoint, type)).toThrowError(
      'service id already used'
    );

    did.removeService(id);
    expect(() => did.getService(id)).toThrowError('service not found');
    expect(() => did.removeService(id)).toThrowError('service not found');
    expect(did.getChanges().service?.remove).toContain(fullId);
  }, 7000);

  it('test DidId addRole, hasRole, removeRole', async () => {
    const did = DidIdRegister.create();

    Object.values(DidRoles).forEach((role) => {
      expect(did.hasRole(role)).toEqual(false);

      did.addRole(role);
      expect(did.hasRole(role)).toEqual(true);
      expect(did.getChanges().role?.add).toContain(role);
      expect(() => did.addRole(role)).toThrowError('role already set');

      did.removeRole(role);
      expect(did.hasRole(role)).toEqual(false);
      expect(() => did.removeRole(role)).toThrowError('role not found');
      expect(did.getChanges().role?.remove).toContain(role);
    });
  }, 7000);

  it('test DidId verificationRelationship', async () => {
    const did = DidIdRegister.create();

    for (const cryptoKeyService of cryptoKeyServices) {
      const key = await cryptoKeyService.generateKeyPair(did.id);

      expect(() =>
        did.addVerificationRelationship(
          key.identifier,
          VerificationRelationshipType.assertionMethod
        )
      ).toThrowError("key doesn't exist in verification method");

      did.addKey(key.identifier, key.publicKey);

      Object.values(VerificationRelationshipType).forEach((vrType) => {
        expect(did.getVerificationRelationship(key.identifier)).not.toContain(
          vrType
        );
        expect(did.hasVerificationRelationship(key.identifier, vrType)).toEqual(
          false
        );
        expect(did.findByVerificationRelationship(vrType)).not.toContain(
          key.identifier
        );
        expect(() =>
          did.removeVerificationRelationship(key.identifier, vrType)
        ).toThrowError('verificationRelationship not found');

        did.addVerificationRelationship(key.identifier, vrType);

        expect(() =>
          did.addVerificationRelationship(key.identifier, vrType)
        ).toThrowError('id already used');
        expect(did.getVerificationRelationship(key.identifier)).toContain(
          vrType
        );
        expect(did.hasVerificationRelationship(key.identifier, vrType)).toEqual(
          true
        );
        expect(did.findByVerificationRelationship(vrType)).toContain(
          key.identifier
        );
        expect(did.getChanges()[vrType]?.add).toContain(key.identifier);

        did.removeVerificationRelationship(key.identifier, vrType);

        expect(did.getVerificationRelationship(key.identifier)).not.toContain(
          vrType
        );
        expect(did.hasVerificationRelationship(key.identifier, vrType)).toEqual(
          false
        );
        expect(did.findByVerificationRelationship(vrType)).not.toContain(
          key.identifier
        );
        expect(() =>
          did.removeVerificationRelationship(key.identifier, vrType)
        ).toThrowError('verificationRelationship not found');
        expect(did.getChanges()[vrType]?.remove).toContain(key.identifier);
      });

      did.removeKey(key.identifier);
    }
  }, 7000);
});
