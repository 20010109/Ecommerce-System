package graph

import (
    "context"
    "fmt"

    "github.com/yourusername/doma-auth-service/graph/generated"
    "github.com/yourusername/doma-auth-service/internal/models"
    "github.com/yourusername/doma-auth-service/internal/services"
)

type mutationResolver struct{ *Resolver }

func (r *mutationResolver) Register(ctx context.Context, username string, email string, password string) (*models.AuthPayload, error) {
    user, err := services.RegisterUser(ctx, username, email, password)
    if err != nil {
        return nil, err
    }

    token, err := services.GenerateToken(user)
    if err != nil {
        return nil, err
    }

    return &models.AuthPayload{
        Token: token,
        User:  user,
    }, nil
}

func (r *mutationResolver) Login(ctx context.Context, email string, password string) (*models.AuthPayload, error) {
    user, err := services.LoginUser(ctx, email, password)
    if err != nil {
        return nil, err
    }

    token, err := services.GenerateToken(user)
    if err != nil {
        return nil, err
    }

    return &models.AuthPayload{
        Token: token,
        User:  user,
    }, nil
}

// Example Query
func (r *queryResolver) HealthCheck(ctx context.Context) (string, error) {
    return "Auth service is up and running!", nil
}

// mutationResolver and queryResolver must implement the generated interfaces:
var _ generated.MutationResolver = &mutationResolver{}
var _ generated.QueryResolver = &queryResolver{}
