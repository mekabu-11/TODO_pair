Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In development, allow localhost origins
    origins ENV.fetch('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:8000')
                .split(',')
                .map(&:strip)

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
