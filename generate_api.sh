#!/usr/bin/env bash

openapi-generator-cli generate \
    -g typescript \
    --type-mappings=DateTime=Date \
    --type-mappings=Date=Date \
    --additional-properties=supportsES6=true \
    --input-spec api-schema.yml \
    --output ./tmp-api/
rm -rf src/api
mkdir src/api
mv -t src/api/ tmp-api/apis tmp-api/auth tmp-api/http tmp-api/models tmp-api/types tmp-api/*.ts
rm -rf tmp-api

prettier --write src/api

find src/api -name "*.ts" -exec sed -i '1s/^/\/\/ @ts-nocheck\n/' {} \;

find src/api -name "*.ts" -exec sed -i -e "s/import { HttpFile }/import type { HttpFile }/g" {} \;

sed -i -e "s/import {HttpLibrary,/import type { HttpLibrary } from '.\/http';\nimport {/g" src/api/http/isomorphic-fetch.ts

sed -i -e "s/import { HttpLibrary/import type { HttpLibrary/g" src/api/configuration.ts
sed -i -e "s/import { Middleware, PromiseMiddleware,/import type { Middleware, PromiseMiddleware } from '.\/http';\nimport {/g" src/api/configuration.ts
sed -i -e "s/import { BaseServerConfiguration,/import type { BaseServerConfiguration } from '.\/servers';\nimport {/g" src/api/configuration.ts
sed -i -e "s/import { configureAuthMethods, AuthMethods, AuthMethodsConfiguration/import type { AuthMethods, AuthMethodsConfiguration } from '.\/auth\/auth';\nimport { configureAuthMethods/g" src/api/configuration.ts

sed -i -e "s/import { Configuration }/import type { Configuration }/g" src/api/apis/baseapi.ts

sed -i -e "s/import {Configuration}/import type { Configuration }/g" src/api/apis/ApiApi.ts
sed -i -e "s/import {SecurityAuthentication}/import type { SecurityAuthentication }/g" src/api/apis/ApiApi.ts
sed -i -e "s/, HttpFile,/,/g" src/api/apis/ApiApi.ts

sed -i -e "s/import {Configuration}/import type { Configuration }/g" src/api/apis/ApiTokenAuthApi.ts
sed -i -e "s/import {SecurityAuthentication}/import type { SecurityAuthentication }/g" src/api/apis/ApiTokenAuthApi.ts
sed -i -e "s/, HttpFile,/,/g" src/api/apis/ApiTokenAuthApi.ts

sed -i -e "s/, HttpFile,/,/g" src/api/types/ObservableAPI.ts
sed -i -e "s/import { Configuration}/import type { Configuration }/g" src/api/types/ObservableAPI.ts

sed -i -e "s/, HttpFile,/,/g" src/api/types/PromiseAPI.ts
sed -i -e "s/import { Configuration}/import type { Configuration }/g" src/api/types/PromiseAPI.ts

sed -i -e "s/export { Configuration }/export type { Configuration }/g" src/api/index.ts
sed -i -e "s/export { PromiseMiddleware as Middleware }/export type { PromiseMiddleware as Middleware }/g" src/api/index.ts
