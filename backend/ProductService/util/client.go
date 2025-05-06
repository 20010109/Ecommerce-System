package util

// GetServiceJWT returns a service token if needed.
func GetServiceJWT() string {
    // If Hasura allows anonymous browsing, return ""
    // Otherwise, hardcode your service JWT here:
    // return "eyJhbGciOiJIUzI1NiIsInR..."
    return ""
}
