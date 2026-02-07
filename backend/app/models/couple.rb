class Couple < ApplicationRecord
  has_many :users, dependent: :nullify
  has_many :tasks, dependent: :destroy

  before_create :generate_invite_code

  validates :invite_code, uniqueness: true, allow_nil: true

  private

  def generate_invite_code
    self.invite_code = SecureRandom.alphanumeric(8).upcase
  end
end
