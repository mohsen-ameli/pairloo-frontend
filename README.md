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

4. You can run the app in several ways.

```bash
npx expo run:android
```

or

```bash
npx expo run:ios
```

or when doing the following, make sure you are using "development build" mode and not "expo go".
You can switch between them by pressing "s".

```bash
npm run dev
```

If you want to refresh the cache use

```bash
npm run dev --reset-cache
```

## Libraries and Assets used

New chat message notification sound:

Sound Effect by <a href="https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=363678">Universfield</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=363678">Pixabay</a>
