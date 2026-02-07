module Api
  class CouplesController < ApplicationController
    # POST /api/couples/join
    def join
      couple = Couple.find_by(invite_code: params[:invite_code]&.upcase)

      if couple.nil?
        return render json: { error: 'Invalid invite code' }, status: :not_found
      end

      if couple.users.count >= 2
        return render json: { error: 'This couple already has two members' }, status: :unprocessable_entity
      end

      if current_user.couple_id == couple.id
        return render json: { error: 'You are already in this couple' }, status: :unprocessable_entity
      end

      # Leave old couple if exists
      old_couple = current_user.couple
      
      current_user.update!(couple: couple, color: 'green')  # Second user gets green
      
      # Delete old couple if empty
      old_couple&.destroy if old_couple&.users&.empty?

      render json: {
        message: 'Successfully joined couple',
        couple_id: couple.id,
        partner: partner_info
      }
    end

    # GET /api/couple
    def show
      if current_couple.nil?
        return render json: { error: 'No couple found' }, status: :not_found
      end

      render json: {
        id: current_couple.id,
        name: current_couple.name,
        invite_code: current_couple.invite_code,
        members: current_couple.users.map { |u| { id: u.id, name: u.name, color: u.color } }
      }
    end

    private

    def partner_info
      partner = current_couple.users.where.not(id: current_user.id).first
      return nil unless partner

      { id: partner.id, name: partner.name, color: partner.color }
    end
  end
end
