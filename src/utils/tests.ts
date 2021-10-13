import faker from 'faker';
import { Arbitrary, integer } from 'fast-check';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fakerToArb = <Generator extends (...args: any[]) => any>(
  fakerGen: Generator,
): Arbitrary<ReturnType<Generator>> => {
  return integer()
    .noBias()
    .noShrink()
    .map<ReturnType<Generator>>((seed) => {
      faker.seed(seed);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return fakerGen();
    });
};
