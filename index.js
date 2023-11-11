import fs from 'fs';
import translate from '@iamtraction/google-translate';
import subsrt from 'subsrt';
import inquirer from 'inquirer';

export const startApp = async () => {
  console.log('OstaSRT v1.1.0');
  console.log('Welcome to the Subtitle Translator App!');

  const { subtitlePath, outputPath, fromLang, toLang } = await inquirer.prompt([
    {
      type: 'input',
      name: 'subtitlePath',
      message: 'Enter the path to the subtitle file:',
    },
    {
      type: 'input',
      name: 'outputPath',
      message: 'Enter the output path for the translated subtitle file:',
    },
    {
      type: 'input',
      name: 'fromLang',
      message: 'Enter the original language of the subtitle (e.g., en):',
    },
    {
      type: 'input',
      name: 'toLang',
      message: 'Enter the language to translate the subtitle to (e.g., fa):',
    },
  ]);

  fs.readFile(subtitlePath, 'utf8', async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const subtitles = subsrt.parse(data);
    let translatedSubtitles = [];

    for (let i = 0; i < subtitles.length; i++) {
      let translationSuccess = false;
      while (!translationSuccess) {
        try {
          const translation = await translate(subtitles[i].text, { from: fromLang, to: toLang });
          translatedSubtitles.push({ ...subtitles[i], text: translation.text });
          console.log(`Subtitle ${i+1} translated successfully.`);
          translationSuccess = true;
        } catch (err) {
          console.error(`Error translating subtitle ${i+1}, retrying...`);
        }
      }
    }

    const translatedSrt = subsrt.build(translatedSubtitles);
    fs.writeFile(outputPath, translatedSrt, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Translation completed successfully. Closing the app...');
        process.exit(0);
      }
    });
  });
};
