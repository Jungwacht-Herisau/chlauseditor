npx @openapitools/openapi-generator-cli generate -g typescript-fetch -o ./tmp-openapi -i http://127.0.0.1:8000/api-schema/ --additional-properties=supportsES6=true
rm -rf src/api
mkdir "src/api"
mv tmp-openapi/apis/* src/api/
rm -rf tmp-openapi
prettier src/api --write