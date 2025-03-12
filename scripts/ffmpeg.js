import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import chalk from "chalk";

// Funzione per ottenere tutti i file nella directory
function getFilesFromDirectory(directoryPath) {
    return fs.readdirSync(directoryPath).filter(file => {
        return file.endsWith('.m4a'); // Puoi aggiungere o modificare l'estensione a seconda del tipo di file che vuoi trattare
    });
}

// Funzione per convertire un file
function convertFile(inputPath, outputPath) {
    console.log(chalk.blue(`Conversione in corso: ${inputPath} -> ${outputPath}`));
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('aac')  // Imposta il codec audio
            .audioBitrate('320k')  // Bitrate audio
            .audioFrequency(44100)  // Frequenza di campionamento
            .noVideo()
            .save(outputPath)  // Salva il file convertito
            .on('end', () => {
                console.log(chalk.blue(`Conversione completata: ${inputPath} -> ${outputPath}`));
                fs.unlinkSync(inputPath);
                resolve();
            })
            .on('error', (err, stdout, stderr) => {
                console.error(`Errore durante la conversione: ${err.message}`);
                console.error('Output:', stdout);
                console.error('Errori:', stderr);
                reject(err);
            });
    });
}

// Funzione principale per elaborare i file nella directory
async function processFiles(inputDir, outputDir) {
    console.log(chalk.blue("Inizio conversione..."));
    const files = getFilesFromDirectory(inputDir);
    if(files.length === 0) {
        console.log(chalk.yellow('Nessun file da convertire.'));
        return
    }
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    for (let file of files) {
        const inputFilePath = path.join(inputDir, file);
        const outputFilePath = path.join(outputDir, file);
        try {
            await convertFile(inputFilePath, outputFilePath);  // Converte il file
        } catch (err) {
            console.log(`Impossibile convertire il file: ${file}`);
        }
    }

    console.log(chalk.green('Tutti i file sono stati elaborati.'));
}

export default { processFiles };

