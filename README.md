# Cordova React Template

A template for leveraging the power of Cordova and React.

Integrating React with Cordova from scratch can be a tedious process and most tutorials do not provide and efficient development process.

This template offers the tools required for an easy and effective development.

## Features

- Webpack
- Cordova Plugins in Development mode
- Ionic Web View for Cordova
- Developing on multiple platforms at the same time

## Dependencies

- Cordova@9.0.0
- React@16.8.6
- cordova-plugin-ionic-webview@4.0.1
- cordova-plugin-qrscanner@2.6.0

## Getting Started

Start by creating a cordova project with template

```bash
cordova create MyReactApp --template cordova-react
```

this will create a new cordova project with cordova-react template.

Go to to your project directory and run

```bash
npm install
```

to install all dependencies.

Now you can modify `public` and `src` directories similar to a create-react-app project.

## Development

To support the Hot Module Reload of Webpack as well as Cordova platforms, two clients have been developed `Development Console` and `Development App`

Two flags can be used with `cordova run {platform}` to support running in development mode.

Flag | Description
:--- | :-----------
devmode | Run the cordova react in development mode
devserver | (optional) Run the development server

e.g.

```bash
    cordova run android --devmode --devserver
```

The above example will run the android app using the development mode and will start the development server.

Alternatively to the `devserver` flag, running

```bash
npm run start:dev
```

will also start the development server.
The main difference between the two methods is their lifespan. The `devserver` flag will terminate when the `cordova run` is terminated while the other one will keep running until manually terminated.

When the development server runs, it will open the `Development Console` in the browser. The `Development Console` is a support tool that will provide a terminal to monitor the wepback process. The `Development Console` also generates QR code and links to access the `React` application using via `browser` or `mobile` platforms.
The links available are: `Local`, `Network` and `Tunnel`

The cordova web resources will be served by the `webpack development server` and all its features will be support, i.e. Hot Module Reload.

### Browser

Make sure to add the browser platform first

```bash
cordova platform add browser
```

then run

```bash
npm run start:dev
```

or

```bash
cordova run browser --devmode --devserver
```

and wait for the `Development Console` to show up.
When the `webpack development server` is ready, the appropriate links will show up. Click on `open` to open the browser platform in a new tab.

Note: if you are trying to use the link on a different device, append `?platform=browser` to the end of the link.

### Mobile (Android/iOS)

Make sure to install the platform,

```bash
cordova platform add android
```

then run

```bash
cordova run android --devmode --devserver
```

this will generate the `Development App` and starts the `Development Console`

The `Development App` uses a QR code plugin to scan the QR code form the `Development Console`

This process allows decoupling the cordova native plugin from the web content, meaning as long as  no changes were done to the plugin you no longer need to rebuild the platform, simply run `npm start:dev` and scan the QR code

## Production

To generate a production build, simply run the default cordova commands, e.g. `cordova build android` or `cordova run browser`, the template will take care of running webpack build and handling all the logistics.

## Troubleshooting

### QRcode not generated in Console

`Local` and `Network` addresses are collected from the output of the `webpack` process, if the compilation of the app files the first time `webpack` starts, it will not output the addresses and consequently the `Tunnel` address is not generated.

Solve any issue preventing the compilation from succeding and restart the development server.