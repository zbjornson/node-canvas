OS=$1;

if [ "$CANVAS_VERSION_TO_BUILD" = "" ]; then
  echo "Can't do anything since you didn't specify which version we're building!";
  echo "Specify the environment variable in AppVeyor/Travis"
  echo "Make sure that building pushes is disabled, and that you are executing builds manually."
  exit 0;
fi;

rm -rf node-canvas
git clone --branch v$CANVAS_VERSION_TO_BUILD --depth 1 https://github.com/Automattic/node-canvas.git || {
  echo "could not find node-canvas version $CANVAS_VERSION_TO_BUILD in NPM";
  exit 1;
}

npm install --ignore-scripts || {
  echo "failed npm install";
  exit 1;
}

if [ "$CANVAS_PREBUILT_VERSION" = "" ]; then
  echo "You need to specify the prebuilt version, which might be different than the"
  echo "canvas version that is being built"
  exit 0;
fi;

source prebuild/$OS/preinstall.sh

cp prebuild/$OS/binding.gyp node-canvas/binding.gyp

for ver in $PREBUILD_NODE_VERSIONS; do 
  echo "------------ Building with node $ver ------------"

  source prebuild/$OS/node_version.sh $ver;

  cd node-canvas

  node-gyp rebuild || {
    echo "error building in nodejs version $ver"
    exit 1;
  }

  cd ..

  source prebuild/$OS/bundle.sh;

  node -e "require('./node-canvas')" || {
    echo "error loading binary";
    exit 1;
  }

  source prebuild/tarball.sh $CANVAS_PREBUILT_VERSION;
done;

# echo "------------ Releasing with release.js ------------"
# source prebuild/$OS/node_version.sh 11
# node prebuild/release.js $PREBUILD_VERSION || exit 1;

cd ..

