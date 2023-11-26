# SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
# SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
#
# SPDX-License-Identifier: Apache-2.0

FROM node:20-alpine3.17
WORKDIR /opossum
COPY package.json /opossum
COPY yarn.lock /opossum
ENV SKIP_POSTINSTALL=1
RUN yarn install --immutable
COPY src/ /opossum/src/
COPY yarn_scripts/ /opossum/yarn_scripts/
COPY index.html /opossum
COPY tsconfig.json /opossum
ENV HOME=.
# RUN yarn ship-linux