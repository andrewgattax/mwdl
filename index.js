import { readFileSync } from 'fs';
import { join } from 'path';
import readline from 'readline';
import chalk from 'chalk'
import gamdl from './scripts/gamdl.js';
import ffmpeg from './scripts/ffmpeg.js';


function getPackageJSON() {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson;
}

function getConfig() {
    const configPath = join(process.cwd(), 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return config;
}

const config = getConfig();

const figlet =
    "    __  ____       ______  __ \n" +
    "   /  |/  / |     / / __ \\/ / \n" +
    "  / /|_/ /| | /| / / / / / /  \n" +
    " / /  / / | |/ |/ / /_/ / /___\n" +
    "/_/  /_/  |__/|__/_____/_____/";

console.log(chalk.blue(figlet));
console.log(chalk.blueBright(`@andrewgattax - V${getPackageJSON().version}`));
console.log(chalk.green(getPackageJSON().description));
console.log(chalk.green("Digita 'help' per la lista dei comandi."));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.setPrompt(chalk.blueBright("> "));

async function handleCommand(input) {
    const args = input.trim().split(" ");
    const command = args.shift().toLowerCase();

    switch (command) {
        case "help":
            console.log(chalk.yellow("Comandi disponibili:"));
            console.log(chalk.cyan("  download -sp {link}"), "- Scarica una canzone da Spotify.");
            console.log(chalk.cyan("  download -am {link}"), "- Scarica una canzone da AppleMusic.");
            console.log(chalk.cyan("  download -sp -p {link}"), "- Scarica una playlist da Spotify.");
            console.log(chalk.cyan("  download -am -p {link}"), "- Scarica una playlist da AppleMusic.");
            console.log(chalk.cyan("  convert-all"), "- Converte tutti i file in attesa");
            console.log(chalk.cyan("  exit"), "- Esci dal programma.");
            break;
        case "download":
            if (args.length < 2) {
                console.log(chalk.red("Errore: Comando non valido. Usa 'help' per vedere i comandi disponibili."));
                break;
            }
            const platform = args.shift();
            const isPlaylist = args.includes("-p");
            const link = args[args.length - 1];

            if (!link.startsWith("http")) {
                console.log(chalk.red("Errore: Devi fornire un link valido."));
                break;
            }

            let scriptPath = "";
            if (platform === "-sp") {
                console.log(chalk.green("Scarico da Spotify.."));
            } else if (platform === "-am") {
                console.log(chalk.redBright("Scarico da AppleMusic.."));
                await gamdl.downloadSong(link);
                if(config.autoconvert) {
                    await ffmpeg.processFiles(join(process.cwd(), "am_temp"), join(process.cwd(), "readyFiles"));
                }
            } else {
                console.log(chalk.red("Errore: Piattaforma non riconosciuta. Usa -sp per Spotify o -am per Apple Music."));
                break;
            }

            break;
        case "convert-all":
            await ffmpeg.processFiles(join(process.cwd(), "am_temp"), join(process.cwd(), "readyFiles"));
        case "exit":
            console.log(chalk.blue("Uscita dal programma..."));
            rl.close();
            process.exit(0);
            break;
        default:
            console.log(chalk.red("Comando non riconosciuto. Digita 'help' per la lista dei comandi."));
    }
}

rl.on("line", async (input) => {
    rl.setPrompt(chalk.blueBright("> "));
    rl.prompt();
    await handleCommand(input);
});