#!/bin/bash

# Copyright © 2021 The Radicle Upstream Contributors
#
# This file is part of radicle-upstream, distributed under the GPLv3
# with Radicle Linking Exception. For full terms see the included
# LICENSE file.

set -Eeou pipefail

echo "Installing Radicle Design System assets"

cp ./node_modules/radicle-design-system/static/*.css ./static/styles
cp ./node_modules/radicle-design-system/static/fonts/*.otf ./static/fonts
