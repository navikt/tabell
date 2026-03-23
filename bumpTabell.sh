if [ -z "$1" ]; then
    echo "Usage: bumpPackage"
    exit 1
fi

CUSTOM_COMMIT_MESSAGE=$1

git pull

echo "Updating $package..."

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is required but not installed."
    exit 1
fi

if [ ! -f package.json ]; then
    echo "No package.json found in $package, skipping."
    cd ..
    continue
fi

# Get and increment the version field (patch bump)
current_version=$(jq -r '.version' package.json)
current_version_without_wip="${current_version%-wip*}"
IFS='.' read -r major minor patch <<< "$current_version_without_wip"

if [[ "$current_version" == *"-wip"* ]]; then
    wip_section="${current_version##*-}"
    wip_ending="${wip_section#wip}"
    current_wip="${wip_ending:-1}"
fi

if [ "$2" = "major" ]; then
  if [ "$3" = "wip" ]; then
    new_major=$((major + 1))
    new_minor=0
    new_patch=0
    new_version="$new_major.$new_minor.$new_patch-wip1"
  else
    new_major=$((major + 1))
    new_minor=0
    new_patch=0
    new_version="$new_major.$new_minor.$new_patch"
  fi
elif [ "$2" = "minor" ]; then
  if [ "$3" = "wip" ]; then
    new_minor=$((minor + 1))
    new_patch=0
    new_version="$major.$new_minor.$new_patch-wip1"
  else
    new_minor=$((minor + 1))
    new_patch=0
    new_version="$major.$new_minor.$new_patch"
  fi
elif [ "$2" = "patch" ]; then
  if [ "$3" = "wip" ]; then
      new_patch=$((patch + 1))
      new_version="$major.$minor.$new_patch-wip1"
  else
      new_patch=$((patch + 1))
      new_version="$major.$minor.$new_patch"
  fi
elif [ "$2" = "wip" ]; then
  if [[ "$current_version" == *"-wip"* ]]; then
    new_version="${current_version_without_wip}-wip$((current_wip + 1))"
  else
    new_patch=$((patch + 1))
    new_version="$major.$minor.$new_patch-wip1"
  fi
else
  if [[ "$current_version" == *"-wip"* ]]; then
  new_version=$current_version_without_wip
  else
    new_patch=$((patch + 1))
    new_version="$major.$minor.$new_patch"
  fi
fi

echo "Bumping version from $current_version to $new_version..."

# Update the version in package.json
jq --arg newver "$new_version" '.version = $newver' package.json > tmp.json && mv tmp.json package.json

rm -rf node_modules
npm install

if ! npm run test; then
  echo "Tests failed. Aborting..."
  exit 1
fi

npm run build
npm run dist

git add .
git commit -m "E - New version $CUSTOM_COMMIT_MESSAGE"
git push

if [[ "$2" = "wip" || "$3" = "wip" ]]; then
  npm publish --tag wip
else
  npm publish
fi


