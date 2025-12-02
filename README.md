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
npm run dev
```

or

```bash
npx expo run:android
```

or

```bash
npx expo run:ios
```

If you want to refresh the cache use

```bash
npm run dev --reset-cache
```
