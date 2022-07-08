import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import {
  defaultCryptoKeyService,
  ECCryptoKeyService,
  RSACryptoKeyService,
} from '@trustcerts/crypto';
import { BbsCryptoKeyService } from '@trustcerts/crypto-bbs';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
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
    const cryptoKeyServices = [
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
          walletService.find(vrType, cryptoKeyService.algorithm)
        ).toContain(key);
      });

      // Remove the key
      walletService.removeKeyByID(key.identifier);

      // Verify that the key is removed
      expect(walletService.findKeyByID(key.identifier)).toBeUndefined();
    }
  }, 10000);

  it('tidy up', async () => {
    const walletService = new WalletService(config);
    await walletService.init();

    // Push new key to local configService of wallet, but don't add it to the DID document
    const invalidKey = await defaultCryptoKeyService.generateKeyPair(
      walletService.did.id
    );
    walletService.configService.config.keyPairs.push(invalidKey);

    expect(walletService.findKeyByID(invalidKey.identifier)).toBe(invalidKey);

    // Remove keys from local configSerive of wallet that don't exist in the DID document
    await walletService.tidyUp();

    expect(walletService.findKeyByID(invalidKey.identifier)).toBeUndefined();
  }, 15000);
});
