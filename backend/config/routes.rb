Rails.application.routes.draw do
  namespace :api do
    # Authentication
    post 'signup', to: 'auth#signup'
    post 'login', to: 'auth#login'
    delete 'logout', to: 'auth#logout'
    get 'me', to: 'auth#me'

    # Couple management
    post 'couples/join', to: 'couples#join'
    get 'couple', to: 'couples#show'

    # Tasks
    resources :tasks do
      member do
        patch 'complete'
      end
      resources :comments, only: [:index, :create]
    end

    # Comments
    resources :comments, only: [:destroy]

    # Push notifications
    post 'push/subscribe', to: 'push#subscribe'
    delete 'push/unsubscribe', to: 'push#unsubscribe'
  end

  # Health check
  get 'up', to: 'rails/health#show', as: :rails_health_check
end
