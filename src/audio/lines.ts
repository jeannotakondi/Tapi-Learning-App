/**
 * Everything Tapi says between activities. Each line becomes one recording:
 * public/audio/tapi/<id>.mp3. The text is also the recording script.
 */
export const TAPI_LINES = {
  'who-is-playing': 'Who is playing?',
  hello: 'Hi! I am Tapi. Touch your picture to play!',
  'new-sound': 'Here is a new sound. Listen!',
  'new-spelling': 'Here is a new way to write a sound you know.',
  'like-in': 'Like in…',
  clusters: 'Listen carefully. Some sounds sit side by side. Can you hear them both?',
  'listen-word': 'Listen to this word.',
  'build-word': 'Can you build it? Drag the sounds.',
  'well-done': 'You did it!',
  'tricky-intro': 'This is a tricky word. You can’t sound it out yet. It says…',
  'find-word': 'Can you find this word?',
  'rhyme-question': 'Which one rhymes with…',
  'claps-question': 'Clap the beats. How many claps?',
  'first-sound-question': 'Which one starts with this sound?',
  'blend-question': 'Listen to the sounds. Which one is it?',
  or: 'or',
  yes: 'Yes!',
  'listen-again': 'Listen again.',
  'lesson-done': 'Brilliant! One more sound has come back to my island.',
  'story-time': 'Story time! Tap a word to hear it.',
  'story-done': 'The end. You read a whole story!',
  goodbye: 'Bye bye! See you soon.',
  'all-done': 'You have been to every island. You can play any lesson again!',
  'placement-start': 'Let’s play a game so I know where to start.',
  'placement-done': 'Thank you! I know where we can start.',
} as const;

export type TapiLineId = keyof typeof TAPI_LINES;
