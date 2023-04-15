import { DidStructure } from '@trustcerts/observer';

export interface InitDidManagerConfigValues<Type extends DidStructure> {
  validateChainOfTrust?: boolean;
  transactions?: Type[];
  time?: string;
  version?: number;
  doc?: boolean;
}
