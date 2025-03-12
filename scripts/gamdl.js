import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import {configDotenv} from "dotenv";

async function downloadSong(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            console.error("Errore: Devi fornire un link di Apple Music.");
            reject()
        }

        const outputFolder = path.join(process.cwd(), "am_temp"); // Cartella di destinazione

        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder);
        }


        const command = `gamdl "${url}" -o "${outputFolder}"`;

        const cProcess = spawn(command, { shell: true });

        cProcess.stdout.on("data", (data) => {
            const output = data.toString('utf8');
            console.log(output);
        });

        cProcess.stderr.on("data", (data) => {
            const output = data.toString('utf8');
            console.error(output);
        });

        cProcess.on("close", (code) => {
            if (code === 0) {
                console.log(chalk.blue("Download completato."));
                resolve();
            } else {
                console.error(chalk.red(`Il processo è terminato con codice ${code}`));
                reject();
            }
        });

    })
}

export default { downloadSong };
