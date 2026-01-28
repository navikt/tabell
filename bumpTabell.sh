
    if [ -z "$1" ]; then
        echo "Usage: bumpPackage"
        return 1
    fi

   CUSTOM_COMMIT_MESSAGE=$1

        git pull

        echo "Updating $package..."

        if ! command -v jq >/dev/null 2>&1; then
            echo "Error: jq is required but not installed."
            return 1
        fi

        if [ ! -f package.json ]; then
            echo "No package.json found in $package, skipping."
            cd ..
            continue
        fi

        # Get and increment the "version" field (patch bump)
        current_version=$(jq -r '.version' package.json)
        IFS='.' read -r major minor patch <<< "$current_version"
        new_patch=$((patch + 1))
        new_version="$major.$minor.$new_patch"
        echo "Bumping version from $current_version to $new_version..."

        # Update the version in package.json
        jq --arg newver "$new_version" '.version = $newver' package.json > tmp.json && mv tmp.json package.json

        rm -rf node_modules
        npm install
        npm run test
        npm run build
        npm run dist

        git add .
        git commit -m "U - New version $CUSTOM_COMMIT_MESSAGE"
        git push

        npm publish
