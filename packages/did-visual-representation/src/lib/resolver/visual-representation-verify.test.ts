import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { PresentationType } from '@trustcerts/gateway';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';
import { DidVisualRepresentationRegister } from '../register/did-visual-representation-register';
import { VisualRepresentationIssuerService } from '../register/visual-representation-issuer-service';
import { DidVisualRepresentationResolver } from './did-visual-representation-resolver';

describe('test VisualRepresentation service', () => {
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
  }, 20000);

  it('verify', async () => {
    if (!config.config.invite) throw new Error();
    const client = new VisualRepresentationIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const representationDid = DidVisualRepresentationRegister.create({
      controllers: [config.config.invite.id],
    });
    const presiId = 'presi';
    const value = 'http://example.com';
    representationDid.addPresentation(presiId, value, PresentationType.html);
    await DidVisualRepresentationRegister.save(representationDid, client);
    const resolver = new DidVisualRepresentationResolver();
    const loadedVisualRepresentationByTransactions = await resolver.load(
      representationDid.id,
      {
        doc: false,
      }
    );
    expect(
      loadedVisualRepresentationByTransactions.getPresentation(presiId).link
    ).toEqual(value);
    const loadedTemplateByDoc = await resolver.load(representationDid.id, {
      doc: true,
    });
    expect(loadedTemplateByDoc.getPresentation(presiId).link).toEqual(value);
  }, 20000);
});
