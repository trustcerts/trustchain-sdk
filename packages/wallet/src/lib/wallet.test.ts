import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import {
  CryptoKeyService,
  defaultCryptoKeyService,
  ECCryptoKeyService,
  RSACryptoKeyService,
} from '@trustcerts/crypto';
import { BbsCryptoKeyService } from '@trustcerts/crypto-bbs';
import {
  DidCreator,
  DidId,
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { exists, remove } from '@trustcerts/helpers';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

/**
 * Test vc class.
 */
describe('wallet', () => {
  let config: ConfigService;

  const testValues = JSON.parse(
    readFileSync('./tests/values-dev.json', 'utf-8')
  );

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);
  });

  it('add and remove key', async () => {
    const cryptoKeyServices: CryptoKeyService[] = [
      new RSACryptoKeyService(),
      new ECCryptoKeyService(),
      new BbsCryptoKeyService(),
    ];
    const walletService = new WalletService(config, cryptoKeyServices);
    await walletService.init();
    // Add a key for each SignatureType
    for (const cryptoKeyService of cryptoKeyServices) {
      // Add a key for each verification relationship
      const key = await walletService.addKey(
        Object.values(VerificationRelationshipType),
        cryptoKeyService.algorithm
      );

      // Check if the key is found by its identifier
      expect(walletService.findKeyByID(key.identifier)).toBe(key);

      // Check if the key is found by vrType and signatureType
      Object.values(VerificationRelationshipType).forEach((vrType) => {
        expect(
          walletService.findKeys(vrType, cryptoKeyService.algorithm)
        ).toContain(key);
      });

      // Remove the key
      walletService.removeKeyByID(key.identifier);

      // Verify that the key is removed
      expect(walletService.findKeyByID(key.identifier)).toBeUndefined();
    }
  }, 10000);
  it('add key with invalid algorithm', async () => {
    const walletService = new WalletService(config);
    await walletService.init();
    await expect(
      walletService.addKey(
        [VerificationRelationshipType.assertionMethod],
        {} as Algorithm
      )
    ).rejects.toThrowError('no service found for');
  }, 10000);

  it('test findOrCreateRSA', async () => {
    const cryptoKeyService = new RSACryptoKeyService();
    const walletService = new WalletService(config, [cryptoKeyService]);
    await walletService.init();
    // findOrCreate for each verification relationship
    for (const vrType of Object.values(VerificationRelationshipType)) {
      // findOrCreate for each algorithm
      // first make sure there are no keys yet, so findOrCreate has to create the key
      const keys = walletService.findKeys(vrType, cryptoKeyService.algorithm);
      for (const key of keys) {
        walletService.removeKeyByID(key.identifier);
      }

      // expect no key to be found
      expect(
        walletService.findKeys(vrType, cryptoKeyService.algorithm)
      ).toHaveLength(0);

      await walletService.findOrCreate(vrType, cryptoKeyService.algorithm);

      // expect that exactly one key was found (because it was created)
      expect(
        walletService.findKeys(vrType, cryptoKeyService.algorithm)
      ).toHaveLength(1);

      // call findOrCreate again and expect that still exactly one key was found (because it was found and not created again)
      await walletService.findOrCreate(vrType, cryptoKeyService.algorithm);
      expect(
        walletService.findKeys(vrType, cryptoKeyService.algorithm)
      ).toHaveLength(1);
    }
  }, 30000);

  it('test findOrCreateEC', async () => {
    const cryptoKeyService = new ECCryptoKeyService();
    const walletService = new WalletService(config, [cryptoKeyService]);
    await walletService.init();
    // findOrCreate for each verification relationship
    for (const vrType of Object.values(VerificationRelationshipType)) {
      // findOrCreate for each algorithm
      // first make sure there are no keys yet, so findOrCreate has to create the key
      const keys = walletService.findKeys(vrType, cryptoKeyService.algorithm);
      for (const key of keys) {
        walletService.removeKeyByID(key.identifier);

        // expect no key to be found
        expect(
          walletService.findKeys(vrType, cryptoKeyService.algorithm)
        ).toHaveLength(0);
        await walletService.findOrCreate(vrType, cryptoKeyService.algorithm);
        // expect that exactly one key was found (because it was created)
        expect(
          walletService.findKeys(vrType, cryptoKeyService.algorithm)
        ).toHaveLength(1);
        // call findOrCreate again and expect that still exactly one key was found (because it was found and not created again)
        await walletService.findOrCreate(vrType, cryptoKeyService.algorithm);
        expect(
          walletService.findKeys(vrType, cryptoKeyService.algorithm)
        ).toHaveLength(1);
      }
    }
  }, 30000);

  it('test findOrCreateBBS', async () => {
    const rsaCryptoKeyService = new RSACryptoKeyService();
    const bbsCryptoKeyService = new BbsCryptoKeyService();
    const walletService = new WalletService(config, [
      bbsCryptoKeyService,
      rsaCryptoKeyService,
    ]);
    await walletService.init();
    const vrType = VerificationRelationshipType.assertionMethod;
    // first make sure there are no keys yet, so findOrCreate has to create the key
    const keys = walletService.findKeys(vrType, bbsCryptoKeyService.algorithm);
    for (const key of keys) {
      walletService.removeKeyByID(key.identifier);
    }

    // expect no key to be found
    expect(
      walletService.findKeys(vrType, bbsCryptoKeyService.algorithm)
    ).toHaveLength(0);

    await walletService.findOrCreate(vrType, bbsCryptoKeyService.algorithm);

    // expect that exactly one key was found (because it was created)
    expect(
      walletService.findKeys(vrType, bbsCryptoKeyService.algorithm)
    ).toHaveLength(1);

    // call findOrCreate again and expect that still exactly one key was found (because it was found and not created again)
    await walletService.findOrCreate(vrType, bbsCryptoKeyService.algorithm);
    expect(
      walletService.findKeys(vrType, bbsCryptoKeyService.algorithm)
    ).toHaveLength(1);
  }, 30000);

  it('tidy up', async () => {
    const walletService = new WalletService(config);
    await walletService.init();

    // Push new key to local configService of wallet, but don't add it to the DID document
    const invalidKey = await defaultCryptoKeyService.generateKeyPair(
      walletService.did.id
    );
    // Push new key with invalid DID to local configService of wallet
    const invalidKey2 = await defaultCryptoKeyService.generateKeyPair(
      'invalid did'
    );
    walletService.configService.config.keyPairs.push(invalidKey);
    walletService.configService.config.keyPairs.push(invalidKey2);

    expect(walletService.findKeyByID(invalidKey.identifier)).toBe(invalidKey);
    expect(walletService.findKeyByID(invalidKey2.identifier)).toBe(invalidKey2);

    // Remove keys from local configSerive of wallet that don't exist in the DID document
    await walletService.tidyUp();

    expect(walletService.findKeyByID(invalidKey.identifier)).toBeUndefined();
    expect(walletService.findKeyByID(invalidKey2.identifier)).toBeUndefined();
  }, 15000);

  it('init wallet with invalid config invite', async () => {
    const tempConfig = new LocalConfigService(testValues.filePath);
    await tempConfig.init(testValues.configValues);
    tempConfig.config.invite = undefined;
    const walletService = new WalletService(tempConfig, []);
    await expect(walletService.init()).rejects.toThrowError('no id found');
  }, 15000);

  it('init wallet with new unused invite', async () => {
    const id = Identifier.generate(DidId.objectName);
    const secret = 'secret';
    const name = 'test-did';
    const didCreator = new DidCreator(testValues.network.gateways, 'dev');
    const invite = await didCreator.createNewInviteForDid(id, name, secret);

    const temporaryConfigPath = './tmp/temporaryConfig';

    const newConfig = new LocalConfigService(temporaryConfigPath);
    await newConfig.init({
      invite: invite,
      name: name,
      keyPairs: [],
    });

    const walletService = new WalletService(newConfig);
    await walletService.init();
    // Expect DID to be created and thus walletService.did to be defined
    expect(walletService.did.id).toEqual(invite.id);

    if (exists(temporaryConfigPath)) {
      remove(temporaryConfigPath);
    }
  }, 20000);

  it('init wallet with new invalid invite', async () => {
    const invite = {
      id: 'invalid',
      secret: 'invalid',
      endpoint: testValues.network.gateways[0],
    };

    const temporaryConfigPath = './tmp/temporaryConfig';

    const newConfig = new LocalConfigService(temporaryConfigPath);
    await newConfig.init({
      invite: invite,
      name: 'invalid',
      keyPairs: [],
    });

    const walletService = new WalletService(newConfig);
    await expect(walletService.init()).rejects.toThrowError(
      'Could not create DID by invite'
    );

    if (exists(temporaryConfigPath)) {
      remove(temporaryConfigPath);
    }
  }, 20000);

  it('createModificationKeyByInvite without invite', async () => {
    const tempConfig = new LocalConfigService(testValues.filePath);
    await tempConfig.init(testValues.configValues);

    const walletService = new WalletService(tempConfig);
    await walletService.init();

    tempConfig.config.invite = undefined;

    await expect(() =>
      walletService.createModificationKeyByInvite(
        defaultCryptoKeyService.algorithm
      )
    ).toThrowError('no invite present');
  }, 20000);

  it('add a key without suitable modification key', async () => {
    // init wallet with only a bbs crypto key service (no RSA/EC)
    const bbsCryptoKeyService = new BbsCryptoKeyService();
    const walletService = new WalletService(config, [bbsCryptoKeyService]);
    await walletService.init();

    // Clear wallet of any keys first
    while (walletService.listKeys().length > 0) {
      const key = walletService.listKeys()[0];
      await walletService.removeKeyByID(key.identifier);
    }

    // Try to add a key
    const vrType = VerificationRelationshipType.assertionMethod;
    await expect(() =>
      walletService.findOrCreate(vrType, bbsCryptoKeyService.algorithm)
    ).rejects.toThrow('no service registered to modify the did');
  }, 30000);
});
