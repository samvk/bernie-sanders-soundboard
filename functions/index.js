const { dialogflow, SimpleResponse, Suggestions, LinkOutSuggestion } = require('actions-on-google');
const functions = require('firebase-functions');
const { randomNumberFromRange, randomPop } = require('./util');
const { playAnotherPhrase, yesPhrase, noPhrase } = require('./translation');

const CLIP_TOTAL_COUNT = 18;

const app = dialogflow({ debug: true });

/** **** DIALOGFLOW ***** */
app.intent(['talk', 'Default Fallback Intent'], (conv) => {
    const region = conv.user.locale.split('-')[0];

    const randomIndex = randomNumberFromRange(1, CLIP_TOTAL_COUNT);

    conv.ask(new SimpleResponse({
        speech: `<speak><audio src='https://bernie-sanders-soundboard-xrvc.firebaseapp.com/audio/clip-${randomIndex}.mp3' /><break time="500ms"/></speak>`,
        text: '🗣️🇺🇸',
    }));
    conv.ask(playAnotherPhrase(region));
    conv.ask(new Suggestions([yesPhrase(region), noPhrase(region)]));
    // Actions on Google does not support donation links yet (https://developers.google.com/assistant/console/policies/general-policies#transactions)
    // conv.ask(new LinkOutSuggestion({ name: '❤️ Donate Now!', url: 'https://secure.actblue.com/donate/samvk-for-sanders?refcode=bernie-sanders-soundboard' }));
    conv.ask(new LinkOutSuggestion({
        name: randomPop(['❤️ Learn more', '🇺🇸 Learn more', '🔥 Learn more']),
        url: 'https://berniesanders.com',
    }));
});

app.intent(['no', 'actions_intent_CANCEL', 'actions_intent_NO_INPUT'], (conv) => {
    conv.close(new SimpleResponse({
        speech: `<speak><break time="1ms"/></speak>`, // HACK::there must be a way to have a silent conv.close()...
        text: `👋`,
    }));
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
