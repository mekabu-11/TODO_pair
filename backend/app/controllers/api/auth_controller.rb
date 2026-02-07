module Api
  class AuthController < ApplicationController
    skip_before_action :authenticate_user, only: [:signup, :login]

    # POST /api/signup
    def signup
      @user = User.new(user_params)
      
      # Create a new couple for the first user
      @user.couple = Couple.create!
      @user.color = 'blue'  # First user gets blue

      if @user.save
        session[:user_id] = @user.id
        render json: user_response(@user), status: :created
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # POST /api/login
    def login
      @user = User.find_by(email: params[:email])

      if @user&.authenticate(params[:password])
        session[:user_id] = @user.id
        render json: user_response(@user)
      else
        render json: { error: 'Invalid email or password' }, status: :unauthorized
      end
    end

    # DELETE /api/logout
    def logout
      session.delete(:user_id)
      render json: { message: 'Logged out successfully' }
    end

    # GET /api/me
    def me
      render json: user_response(current_user)
    end

    private

    def user_params
      params.permit(:email, :name, :password, :password_confirmation)
    end

    def user_response(user)
      {
        id: user.id,
        email: user.email,
        name: user.name,
        color: user.color,
        couple_id: user.couple_id,
        invite_code: user.couple&.invite_code,
        partner: partner_info(user)
      }
    end

    def partner_info(user)
      partner = user.couple&.users&.where&.not(id: user.id)&.first
      return nil unless partner

      { id: partner.id, name: partner.name, color: partner.color }
    end
  end
end
