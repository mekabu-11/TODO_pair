class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :authenticate_user

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def authenticate_user
    unless current_user
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def current_couple
    current_user&.couple
  end
end
