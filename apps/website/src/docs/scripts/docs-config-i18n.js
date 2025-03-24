import * as fs from "node:fs/promises";
import * as fssync from "node:fs";
import { join } from "path";
import readline from "readline";
import { removeHrefTranslations } from "./utils/remove-href-translations.js";
import { removeTextTranslations } from "./utils/remove-text-translations.js";
import { replaceInFiles } from "./utils/replace-in-files.js";
import { copyFolderSync } from "./utils/copy-folder.js";
const logging = false;
const astroConfigPath = join("astro.config.mjs");
const siteSettingsPath = join("src", "docs", "config", "siteSettings.json.ts");
const translationDataPath = join("src", "docs", "config", "translationData.json.ts");
const srcConfigFolder = join("src", "docs", "config");
const srcContentFolder = join("src", "docs", "data");
async function readFileWithFallback(filePath, defaultContent = "") {
    try {
        return await fs.readFile(filePath, "utf-8");
    }
    catch (error) {
        console.warn(`Warning: Could not read ${filePath}. Using default content.`);
        return defaultContent;
    }
}
const validateLocale = (locale) => {
    const localeRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    return localeRegex.test(locale);
};
const logSection = (title) => {
    console.log("\n" + "=".repeat(title.length + 2));
    console.log(` ${title}`);
    console.log("=".repeat(title.length + 2) + "\n");
};
async function configI18n() {
    logSection("This script will help configure the docs i18n settings");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    // ask if the user wants one language or multiple. Make it a select field
    const multipleLanguages = await new Promise((resolve) => {
        rl.question("Do you plan to use multiple languages? (y/n): ", (answer) => {
            resolve(answer.toLowerCase() === "y");
        });
    });
    console.log("\nNOTE: locale examples can be seen at: https://github.com/cospired/i18n-iso-languages");
    // ask the user what they want their default website locale to be
    const newDefaultLocale = await new Promise((resolve) => {
        const promptLocale = () => {
            rl.question("\nWhat is the default locale for your website? (e.g. en): ", (answer) => {
                const sanitizedAnswer = answer.replace(/\s+/g, "").toLowerCase();
                if (validateLocale(sanitizedAnswer)) {
                    resolve(sanitizedAnswer);
                }
                else {
                    console.log("\nInvalid locale format. Please use format like 'en' or 'en-US'");
                    promptLocale();
                }
            });
        };
        promptLocale();
    });
    let newLocales = [];
    if (multipleLanguages) {
        // ask the user for any additional locales they want to use, separated by commas
        newLocales = await new Promise((resolve) => {
            rl.question("\nWhat other locales do you plan to use? (separated by commas): ", (answer) => {
                // split by comma and trim whitespace
                const sanitizedAnswer = answer.split(",").map((locale) => locale.trim().toLowerCase());
                resolve(sanitizedAnswer);
            });
        });
    }
    // add the default locale to the locales array
    newLocales.push(newDefaultLocale);
    // loop through newLocales and remove any duplicates or empty strings
    const newLocalesSet = new Set(newLocales);
    const newLocalesArray = [...newLocalesSet].filter((locale) => locale !== "");
    newLocales = newLocalesArray;
    // create newLocaleString for the astro.config.mjs file
    const newLocalesString = newLocales.map((locale) => `"${locale}"`).join(", ");
    console.log(`\nDefault locale: "${newDefaultLocale}"`);
    // console.log(`Locales: [${newLocales}]`);
    console.log(`Locales: [${newLocalesString}]\n`);
    // confirm the locales with the user
    const localesConfirmed = await new Promise((resolve) => {
        rl.question("Are the above locales correct? (y/n): ", (answer) => {
            resolve(answer.toLowerCase() === "y");
        });
    });
    if (!localesConfirmed) {
        rl.close();
        console.log("\nPlease re-run the script and try again.\n");
        process.exit(0);
    }
    // --------------------------------------------------------
    // read astro.config.mjs and get the defaultLocale string
    let astroConfig = await readFileWithFallback(astroConfigPath);
    const defaultLocaleMatch = astroConfig.match(/defaultLocale: "(.*?)"/);
    if (!defaultLocaleMatch) {
        throw new Error("Could not find defaultLocale in astro.config.mjs");
    }
    const defaultLocale = defaultLocaleMatch[1];
    // get all the locales and put into an array
    const currLocalesMatch = astroConfig.match(/locales: \[(.*?)\]/);
    if (!currLocalesMatch) {
        throw new Error("Could not find locales array in astro.config.mjs");
    }
    const currLocales = currLocalesMatch[1];
    const currLocalesArray = currLocales.split(",").map((locale) => locale.replace(/"/g, "").trim());
    if (logging) {
        console.log(`Locales: ${currLocalesArray}`);
    }
    /**
     * Building the logic to edit the various files and folders
     */
    let editOldDefaultToNewDefault;
    const localesToAdd = [];
    const localesToRemove = [];
    // if newDefaultLocale already exists in oldLocales
    if (currLocalesArray.includes(newDefaultLocale)) {
        editOldDefaultToNewDefault = false;
        // add new locales that don't exist in oldLocales
        newLocales.forEach((locale) => {
            if (!currLocalesArray.includes(locale)) {
                localesToAdd.push(locale);
            }
        });
        // remove old locales that don't exist in newLocales
        currLocalesArray.forEach((locale) => {
            if (!newLocales.includes(locale)) {
                localesToRemove.push(locale);
            }
        });
    }
    else {
        // if newDefaultLocale doesn't exist in oldLocales
        if (newLocales.includes(defaultLocale)) {
            // oldDefaultLocale exists in newLocales
            // don't edit old to new default, just add as new locale
            editOldDefaultToNewDefault = false;
            // add new locales that don't exist in oldLocales
            newLocales.forEach((locale) => {
                if (!currLocalesArray.includes(locale)) {
                    localesToAdd.push(locale);
                }
            });
            // remove old locales that don't exist in newLocales
            currLocalesArray.forEach((locale) => {
                if (!newLocales.includes(locale)) {
                    localesToRemove.push(locale);
                }
            });
        }
        else {
            // oldDefaultLocale doesn't exist in newLocales
            // edit old to new default
            editOldDefaultToNewDefault = true;
            // add new locales that don't exist in oldLocales, except for newDefaultLocale
            newLocales.forEach((locale) => {
                if (!currLocalesArray.includes(locale) && locale !== newDefaultLocale) {
                    localesToAdd.push(locale);
                }
            });
            // remove old locales that don't exist in newLocales, except for defaultLocale
            currLocalesArray.forEach((locale) => {
                if (!newLocales.includes(locale) && locale !== defaultLocale) {
                    localesToRemove.push(locale);
                }
            });
        }
    }
    if (logging) {
        console.log("\neditOldDefaultToNewDefault", editOldDefaultToNewDefault);
        console.log("localesToAdd", localesToAdd);
        console.log("localesToRemove", localesToRemove);
    }
    // replace the defaultLocale string with the new defaultLocale
    astroConfig = astroConfig.replace(`defaultLocale: "${defaultLocale}"`, `defaultLocale: "${newDefaultLocale}"`);
    // replace locales array with the new locales
    astroConfig = astroConfig.replace(`locales: [${currLocales}]`, `locales: [${newLocalesString}]`);
    // write the new astro.config.mjs
    await fs.writeFile(astroConfigPath, astroConfig, "utf-8");
    console.log("\nupdated astro.config.mjs");
    // --------------------------------------------------------
    // now we will edit siteSettings.json.ts
    let siteSettings = await readFileWithFallback(siteSettingsPath);
    // change defaultLocale to new defaultLocale
    siteSettings = siteSettings.replace(`defaultLocale = "${defaultLocale}"`, `defaultLocale = "${newDefaultLocale}"`);
    // change locales to new locales
    siteSettings = siteSettings.replace(/locales\s*=\s*\[.*?\]/, `locales = [${newLocalesString}]`);
    // if a line contains "localeToRemove:" then remove the whole line
    // the line will look semething like `fr: "fr-FR",` or `fr: "Français",`
    localesToRemove.forEach((locale) => {
        siteSettings = siteSettings.replace(new RegExp(`${locale}:.*?,`, "g"), "");
    });
    if (editOldDefaultToNewDefault) {
        // replace all old "defaultLocale:" with new "defaultLocale:"
        siteSettings = siteSettings.replace(new RegExp(`${defaultLocale}:`, "g"), `${newDefaultLocale}:`);
    }
    // add new locales to the siteSettings.json.ts
    localesToAdd.forEach((locale) => {
        siteSettings = siteSettings.replace("localeMap = {", `localeMap = {\n  ${locale}: "${locale}",`);
        siteSettings = siteSettings.replace("languageSwitcherMap = {", `languageSwitcherMap = {\n  ${locale}: "${locale.toUpperCase()}",`);
    });
    // write the new site-settings.json.ts
    await fs.writeFile(siteSettingsPath, siteSettings, "utf-8");
    console.log("updated src/docs/config/siteSettings.json.ts");
    // --------------------------------------------------------
    // now we will edit translationData.json.ts
    let translationData = await readFileWithFallback(translationDataPath);
    // uppercase the first letter of the defaultLocale
    const defaultLocaleUppercase = defaultLocale.charAt(0).toUpperCase() + defaultLocale.slice(1);
    // first uppercase the first letter of the newDefaultLocale
    const newDefaultLocaleUppercase = newDefaultLocale.charAt(0).toUpperCase() + newDefaultLocale.slice(1);
    // gather what Data{defaultLocale} strings are in the translationData.json.ts
    // it should include the text before Data{defaultLocale}
    // this will look like siteDataEn, navDataEn, etc
    const dataItems = [];
    const dataLocaleRegex = new RegExp(`(\\w+Data)${defaultLocaleUppercase}`, "g");
    let match;
    while ((match = dataLocaleRegex.exec(translationData)) !== null) {
        dataItems.push(match[0]);
    }
    // remove duplicates
    const dataItemsSet = new Set(dataItems);
    // remove the defaultLocaleUppercase from the end of each set element
    // this will turn siteDataEn into siteData
    // reset the array
    dataItems.length = 0;
    dataItemsSet.forEach((dataLocale) => {
        const dataItem = dataLocale.replace(defaultLocaleUppercase, "");
        dataItems.push(dataItem);
    });
    // console.log("dataItems", dataItems);
    // get textTranslations object for the defaultLocale, this will look like "en: {hero_text: "Hello World", ...}"
    // first get the textTranslations object, looks like "export const textTranslations = {...}"
    const textTranslationsRegex = /export const textTranslations = ({(?:{[^{}]*}|[^{}])*})/;
    const textTranslationsObject = translationData.match(textTranslationsRegex);
    if (!textTranslationsObject) {
        throw new Error("Could not find textTranslations object in translationData.json.ts");
    }
    const textTranslationsObjectValue = textTranslationsObject[1];
    // console.log("textTranslationsObject", textTranslationsObjectValue);
    // now in the textTranslationsObject, get the defaultLocale object
    const defaultTextTranslationObjectRegex = new RegExp(`${defaultLocale}: {[^}]*}`, "g");
    const defaultTextTranslationObject = textTranslationsObjectValue.match(defaultTextTranslationObjectRegex);
    if (!defaultTextTranslationObject) {
        throw new Error(`Could not find defaultLocale object in textTranslations object in translationData.json.ts`);
    }
    const defaultTextTranslationObjectValue = defaultTextTranslationObject[0];
    // console.log("defaultTextTranslationObject", defaultTextTranslationObjectValue);
    // get routeTranslations object for the defaultLocale
    const routeTranslationsRegex = /export const routeTranslations = ({(?:{[^{}]*}|[^{}])*})/;
    const routeTranslationsObject = translationData.match(routeTranslationsRegex);
    if (!routeTranslationsObject) {
        throw new Error("Could not find routeTranslations object in translationData.json.ts");
    }
    const routeTranslationsObjectValue = routeTranslationsObject[1];
    // console.log("routeTranslationsObject", routeTranslationsObjectValue);
    // now in the routeTranslationsObject, get the defaultLocale object
    const defaultRouteTranslationsObjectRegex = new RegExp(`${defaultLocale}: {[^}]*}`, "g");
    const defaultRouteTranslationObject = routeTranslationsObjectValue.match(defaultRouteTranslationsObjectRegex);
    if (!defaultRouteTranslationObject) {
        throw new Error(`Could not find defaultLocale object in routeTranslations object in translationData.json.ts`);
    }
    const defaultRouteTranslationObjectValue = defaultRouteTranslationObject[0];
    // console.log("defaultRouteTranslationObject", defaultRouteTranslationObjectValue);
    if (editOldDefaultToNewDefault) {
        // replace all old "defaultLocale:" with new "defaultLocale:"
        translationData = translationData.replace(new RegExp(`${defaultLocale}:`, "g"), `${newDefaultLocale}:`);
        // replace all old "/defaultLocale/" with new "/defaultLocale/"
        translationData = translationData.replace(new RegExp(`/${defaultLocale}/`, "g"), `/${newDefaultLocale}/`);
        // replace all old "Data{defaultLocaleUppercase}" with new "Data{newDefaultLocaleUppercase}"
        translationData = translationData.replace(new RegExp(`Data${defaultLocaleUppercase}`, "g"), `Data${newDefaultLocaleUppercase}`);
    }
    // for each element of localesArray that isn't in newLocales, remove its section from translationData
    // for example, if localesArray is ["en", "fr"] and newLocales doesn't contain "fr", remove all instances of the "fr" section
    // which will look like "fr: {...},"
    localesToRemove.forEach((locale) => {
        const regex = new RegExp(`${locale}: {[^}]*},`, "g");
        translationData = translationData.replace(regex, "");
        // remove import statements - if a line contains `/locale/` then remove the whole line
        const regex2 = new RegExp(`.*/${locale}/.*\\n?`, "g");
        translationData = translationData.replace(regex2, "");
    });
    // add new locales to the translationData.json.ts
    localesToAdd.forEach((locale) => {
        // first uppercase the first letter of the locale
        const localeUppercase = locale.charAt(0).toUpperCase() + locale.slice(1);
        // add all imports, start where the first import statement is
        const importIndex = translationData.indexOf("import");
        dataItems.forEach((dataItem) => {
            // these are "siteData", "navData", etc
            const importString = `import ${dataItem}${localeUppercase} from "./${locale}/${dataItem}.json";\n`;
            // insert the importString before the first import statement
            translationData =
                translationData.slice(0, importIndex) + importString + translationData.slice(importIndex);
        });
        // add the new locale to the dataTranslations object
        // first, after "export const dataTranslations = {", add a newline with "{locale}: {"
        translationData = translationData.replace("export const dataTranslations = {", `export const dataTranslations = {\n  ${locale}: {}`);
        // inside this "${locale}: {" object, add all the dataItems
        let dataTranslationsLocaleString = "";
        dataItems.forEach((dataItem) => {
            const dataLocaleString = `${dataItem}: ${dataItem}${localeUppercase},`;
            // append the dataLocaleString to the dataTranslationsLocaleString
            dataTranslationsLocaleString += `\n    ${dataLocaleString}`;
        });
        // console.log(`Locale: ${locale}`);
        // console.log(
        //   `Data Translations Locale String: ${dataTranslationsLocaleString}`,
        // );
        // fill the dataTranslations object
        translationData = translationData.replace(new RegExp(`${locale}: {}`, "g"), `${locale}: {${dataTranslationsLocaleString}\n  },`);
        // now we will do the textTranslations object
        // we already gathered info above "defaultTextTranslationObject" and "defaultRouteTranslationObject"
        const localeTextTranslationObject = defaultTextTranslationObjectValue.replace(new RegExp(`${defaultLocale}: {`, "g"), `${locale}: {`);
        // insert it
        translationData = translationData.replace("export const textTranslations = {", `export const textTranslations = {\n  ${localeTextTranslationObject},`);
        // now we will do the routeTranslations object
        const localeRouteTranslationObject = defaultRouteTranslationObjectValue.replace(new RegExp(`${defaultLocale}: {`, "g"), `${locale}: {`);
        // insert it
        translationData = translationData.replace("export const routeTranslations = {", `export const routeTranslations = {\n  ${localeRouteTranslationObject},`);
    });
    // write the new translationData.json.ts
    await fs.writeFile(translationDataPath, translationData, "utf-8");
    console.log("updated src/docs/config/translationData.json.ts");
    // --------------------------------------------------------
    // now we will work on folder names
    // Replace the existing folder operations with this improved version
    const handleFolderOperation = (operation, path) => {
        try {
            operation(path);
            if (logging) {
                console.log(`Successfully processed ${path}`);
            }
        }
        catch (error) {
            console.error(`Error processing ${path}: ${error.message}`);
        }
    };
    // Update the deleteFolders function
    const deleteFolders = (folderPath) => {
        if (!fssync.existsSync(folderPath))
            return;
        const files = fssync.readdirSync(folderPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = join(folderPath, file.name);
            if (file.isDirectory()) {
                if (localesToRemove.includes(file.name)) {
                    handleFolderOperation(() => fssync.rmSync(filePath, { recursive: true }), filePath);
                }
                else {
                    deleteFolders(filePath);
                }
            }
        }
    };
    // recursively rename all defaultLocale folders to newDefaultLocale
    const renameFolders = (folderPath) => {
        const files = fssync.readdirSync(folderPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = join(folderPath, file.name);
            if (file.isDirectory()) {
                if (file.name === defaultLocale) {
                    const newFolderPath = join(folderPath, newDefaultLocale);
                    fssync.renameSync(filePath, newFolderPath);
                    if (logging) {
                        console.log(`Renamed folder ${filePath} to ${newFolderPath}`);
                    }
                }
                else {
                    renameFolders(filePath);
                }
            }
        }
    };
    // recursively add all new locales to folders
    const addFolders = (folderPath) => {
        const files = fssync.readdirSync(folderPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = join(folderPath, file.name);
            if (file.isDirectory()) {
                // console.log("file.name", file.name);
                if (file.name == defaultLocale) {
                    localesToAdd.forEach((locale) => {
                        const newFolderPath = join(folderPath, locale);
                        copyFolderSync(filePath, newFolderPath);
                        if (logging) {
                            console.log(`Copied folder ${filePath} to ${newFolderPath}`);
                        }
                    });
                }
                else if (file.isDirectory()) {
                    addFolders(filePath);
                }
            }
        }
    };
    addFolders(srcContentFolder);
    addFolders(srcConfigFolder);
    deleteFolders(srcContentFolder);
    deleteFolders(srcConfigFolder);
    if (editOldDefaultToNewDefault) {
        renameFolders(srcContentFolder);
        renameFolders(srcConfigFolder);
    }
    // for src/config/{newDefaultLocale}/navData.json.ts replace any old `"defaultLocale"` with new `"newDefaultLocale"`
    const navDataPath = join(srcConfigFolder, newDefaultLocale, "navData.json.ts");
    let navData = await fs.readFile(navDataPath, "utf-8");
    if (editOldDefaultToNewDefault) {
        navData = navData.replace(new RegExp(`"${defaultLocale}"`, "g"), `"${newDefaultLocale}"`);
    }
    await fs.writeFile(navDataPath, navData, "utf-8");
    // check if there is currently a folder like src/pages/[locale] for any locale in currLocalesArray
    // if there is, then for each newLocale in localesToAdd, copy the folder src/pages/[locale] to src/pages/[newLocale] using copyFolderSync()
    const srcPagesFolder = join("src", "pages");
    for (const locale of currLocalesArray) {
        const localeFolder = join(srcPagesFolder, locale);
        if (fssync.existsSync(localeFolder)) {
            // Found an existing locale folder, copy it for each new locale
            localesToAdd.forEach((newLocale) => {
                const newLocaleFolder = join(srcPagesFolder, newLocale);
                copyFolderSync(localeFolder, newLocaleFolder);
                if (logging) {
                    console.log(`Copied folder ${localeFolder} to ${newLocaleFolder}`);
                }
                // in this newLocaleFolder, search through every file and replace any `"${locale}"` with `"${newLocale}"`
                replaceInFiles(newLocaleFolder, `['"]${locale}['"]`, `"${newLocale}"`, logging);
            });
            break; // Only need to find one existing locale folder to copy from
        }
    }
    // for each localesToRemove, remove their folder from src/pages/locale
    localesToRemove.forEach((locale) => {
        try {
            const localeFolder = join(srcPagesFolder, locale);
            fssync.rmSync(localeFolder, { recursive: true });
            if (logging) {
                console.log(`Deleted folder ${localeFolder}`);
            }
        }
        catch (error) {
            console.log(`Error deleting folder: src/pages/${locale}`);
        }
    });
    console.log("updated the src/pages/[locale] folders");
    // if only one language, remove various translation features that are not needed
    if (!multipleLanguages) {
        await removeHrefTranslations();
        await removeTextTranslations();
    }
    // --------------------------------------------------------
    rl.close();
    logSection("Configuration Complete!");
    if (multipleLanguages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Next steps:");
        console.log("1. Update 'localeMap' in src/docs/config/siteSettings.json.ts");
        console.log("2. Update 'languageSwitcherMap' in src/docs/config/siteSettings.json.ts");
        console.log("3. Review your translation files in src/docs/config/[locale]/\n");
    }
    // add a small delay before showing the final message
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // cheers from Cosmic Themes!
    console.log(" Thank you for using Cosmic Themes \n");
    await new Promise((resolve) => setTimeout(resolve, 1000));
}
configI18n();
//# sourceMappingURL=docs-config-i18n.js.map