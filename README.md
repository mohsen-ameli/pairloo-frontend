## Get started

0. Amazing docs on how to set up an emulator/device: https://docs.expo.dev/get-started/set-up-your-environment/

IMPORTANT: make sure to use android version 9 (pie) and API version 28, for the video
playback in the front page to work properly. Other versions might crash the emulator.

1. After setting up an emulator, if you're using android emulator, make sure you are port forwarding port 8000 from the emulator to your machine.
   You can do so by running the following command (note: you need to do this every time you start the emulator)

```
adb reverse tcp:8000 tcp:8000
```

This makes sure that the emulator can access the backend via http://localhost:8000 by port forwarding the backend port through to the emulator.

2. Install dependencies

```bash
npm i
```

3. Pre-build the app

```bash
npx expo prebuild
```

4. Compile the app

```bash
npm run android
```

or if on ios

```bash
npm run ios
```

5. After the initial compile, you can thereafter run `npm run dev` for faster run times.

## Notes on running app

Expo has two modes: Expo Go, and Development Build.
Basically Expo Go is a watered down version of Development Build.
Dev build is typically better since it's essentially the final product users will download,
but Expo Go is a bit easier to set up, however it's recommended to use development build.

If you are running the app on a real device (either expo go or development build) you will need to be on the same network as the servers, and know the IP address of the backend. You can use the `copy_public_ip_to_env.sh` script to change the .env file accordingly.

## Development

| Command                                                                 | What it does                                          | When to use it                                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| npm run android / npm run ios / npx expo run:android / npx expo run:ios | Compiles native code, installs the app, starts Metro. | First build, after adding a native library, or after modifying a config plugin. |
| npm run dev / npx expo start                                            | Starts only the Metro bundler.                        | Daily development when only changing JavaScript or TypeScript code.             |

## Production

On railway set the port under networking to 8081
Custom build command: npx expo export --platform web
Custom start command: npx expo serve

# Notes

When using our state management library, if the atom is using AsyncStorage or SecureStorage
the data within that atom, will need to be awaited.

When overriding atoms that use AsyncStorage or SecureStorage, you need to pass the old
value, and make sure to await the prev state: await prev => ({...prev}).

If you accidentally don't await the state, the storage will be messy and will need to be cleared (shown below)

Call the following snippet to erase old data from AsyncStorage in a dummy useEffect anywhere in the app.

```js
AsyncStorage.multiRemove(["name-of-storage"])
```

If any JWT token is involved with the web version of the app, you MUST have credentials: "include" set in the fetch. This should already
be the case wherever we use fetch, but it's a very important detail.

## Libraries and Assets used

New chat message notification sound:

Sound Effect by <a href="https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=363678">Universfield</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=363678">Pixabay</a>

We use the following repo to gather the calling codes of all countries: https://www.npmjs.com/package/world-countries
