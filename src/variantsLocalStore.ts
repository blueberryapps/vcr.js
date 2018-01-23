import * as chalk from 'chalk';
export type Variants = string[];

let variantsStore: Variants | undefined = [];

export const setVariantsLocaly = (variants: Variants) => {
    if (process.env.STORE_VARIANTS_LOCALY) {
        console.log(`${chalk.magenta('[Stub server]')} Storing variants to local store`, (variants || []).join(', '));
        variantsStore = variants.length > 0 ? variants : undefined;
    }
}

export const getLocalVariants = (): Variants | undefined => {
    if (process.env.STORE_VARIANTS_LOCALY && variantsStore && variantsStore.length > 0) {
        console.log(`${chalk.magenta('[Stub server]')} Using localy stored variants`, (variantsStore || []).join(', '));
        return variantsStore;
    }
    return undefined;
}
