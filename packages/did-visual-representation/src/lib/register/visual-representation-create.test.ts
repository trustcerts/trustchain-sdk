import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';
import { VisualRepresentationIssuerService } from './visual-representation-issuer-service';
import { DidVisualRepresentationRegister } from './did-visual-representation-register';
import { PresentationType } from '@trustcerts/gateway';

describe('test visual representation service', () => {
  let config: ConfigService;

  let cryptoService: CryptoService;

  const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

  beforeAll(async () => {
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

  it('create', async () => {
    if (!config.config.invite) throw new Error();
    const client = new VisualRepresentationIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const representationDid = DidVisualRepresentationRegister.create({
      controllers: [config.config.invite.id],
    });
    representationDid.addPresentation(
      'presi',
      'http://example.com',
      PresentationType.html
    );
    const res = await DidVisualRepresentationRegister.save(
      representationDid,
      client
    );
    //TODO when adding a pdf encode it
    expect(res).toBeDefined();
  }, 20000);
});
