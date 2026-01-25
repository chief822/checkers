### Overview
This is a online checkers game without any backend so it's not required. It works using webrtc. It's available both online on a browser (*LINK*: http://chief822.github.io/checkers)
and on android (check github releases for app.apk). Both of these versions don't have TURN relay so may not work on certain networks.

### Running website locally
do the usual install dependencies using `npm install` then run with `npm run dev`.

### Building apk for android manually
first cd into android directory `cd android`.
Next step is a bit hard. If you bulid conventionlly using `./gradlew assembleRelease` then there always seems to be a problem in the apk that makes connection establishing using webrtc fail so currently doing this way.
Use the debug version of apk using `npx cap run android`. output is in `android/app/build/outputs/apk/debug/app-debug.apk` or maybe use `./gradlew assembleDebug` i havn't tried it to confirm. You can check online to set up your environments to make these commands work.

### TROUBLESHOOT
Connection error:\
First make sure you arent behind a restrictive NAT like symmetric NAT you can confirm with a free online tool like checkmynat otherwise switch to a different wifi.
\
\
Trying making the other way instead. For example if device A is making the first offer when connecting with device B, start with device B instead. This may work as certain devices have restrictive firewall like limited UDP ports which make direct webrtc connection difficult. If still not try with different devices
