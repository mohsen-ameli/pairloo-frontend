## Get started

1. Make sure Android studio is set up and an Android emulator is running.
   Also make sure you are port forwarding port 8000 from the emulator to your machine.
   Covered in the backend repo README.

2. Install dependencies

```bash
npm i
```

3. Pre-build the app

```bash
npx expo prebuild
```

4. Expo has two modes: Expo Go, and Development Build.
   Basically Expo Go is a watered down version of Development Build.
   Dev build is typically better since it's essentially the final product users will download,
   but Expo Go is a bit easier to set up.

Amazing docs on how to set things up: https://docs.expo.dev/get-started/set-up-your-environment/

## Note

If you are running an emulator on your system, then the backend can be accessed by going to http://localhost:8000.
Make sure the following are set in this repo (frontend) .env file:

```
EXPO_PUBLIC_SERVER_URL="http://localhost:8000"
EXPO_PUBLIC_WS_SERVER_URL="ws://localhost:8000"
```

However, if you are running the app on a real device (either expo go or development build) then you will need to be on the same network as the servers, and know the IP address of the backend. You can use the `copy_public_ip_to_env.sh` script to change the .env file accordingly.

## Libraries and Assets used

New chat message notification sound:

Sound Effect by <a href="https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=363678">Universfield</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=363678">Pixabay</a>

# Notes

When using our state management library, if the atom is using AsyncStorage or SecureStorage
the data within that atom, will need to be awaited.

When overriding atoms that use AsyncStorage or SecureStorage, you need to pass the old
value, and NOT use the prev => ({...prev}) syntax, like you would with normal react states.

If you accidentally do use this, just clear the storage (shown below)

Call the following snippet to erase old data from AsyncStorage:

```js
AsyncStorage.multiRemove(["name-of-storage"])
```
