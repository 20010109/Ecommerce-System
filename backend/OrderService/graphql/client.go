package graphql

import (
    "github.com/machinebox/graphql"
)

var client *graphql.Client

// InitClient initializes the GraphQL client with Hasura endpoint
func InitClient(endpoint string) {
    client = graphql.NewClient(endpoint)
}

// GetClient returns the singleton GraphQL client
func GetClient() *graphql.Client {
    return client
}

